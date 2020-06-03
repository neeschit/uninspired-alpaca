import { getConnection } from "../connection/pg";
import { AlpacaTradeConfig, AlpacaOrder } from "@neeschit/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { PositionConfig } from "./position";
import { TimeInForce, OrderStatus, TradeDirection, TradeType } from "../data/data.model";
import { isBacktestingEnv } from "../util/env";
import { QueryResult } from "pg";

export interface Order {
    id: number;
    positionId: number;
    symbol: string;
    filledQuantity?: number;
    averagePrice?: number;
    stopPrice?: number;
    limitPrice: number;
    side: TradeDirection;
    quantity: number;
    tif: TimeInForce;
    status: OrderStatus;
    type: TradeType;
}

interface OrderDb {
    id: number;
    position_id: number;
    symbol: string;
    status: string;
    side: string;
    type: string;
    tif: string;
    quantity: number;
    stop_price: number;
    limit_price: number;
    filled_quantity: number;
    average_price: number;
}

export const getCreateOrdersTableSql = () => `
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create table orders (
    id serial primary key,
    position_id integer references positions(id),
    symbol varchar(8) not null,
    status text not null,
    side text not null,
    type text not null,
    tif varchar(6) not null,
    quantity smallint not null,
    stop_price numeric,
    limit_price numeric,
    filled_quantity smallint,
    average_price numeric,
    alpaca_order_info jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

create index orders_symbol_idx on orders (symbol);
create index orders_side_idx on orders (side);
create index orders_status_idx on orders (status);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`;

const getInsertOrdersSql = (
    order: AlpacaTradeConfig,
    position: PositionConfig,
    orderStatus: OrderStatus
) => {
    return `
        begin;
        select * from orders where symbol = '${position.symbol}' FOR SHARE;
        insert into orders (position_id, symbol, status, side, type, tif, quantity ${
            order.stop_price || order.limit_price ? "," : ""
        } ${order.stop_price ? "stop_price," : ""} ${order.limit_price ? "limit_price" : ""}) 
        select
            ${position.id}, 
            '${position.symbol}', 
            '${orderStatus}', 
            '${order.side}', 
            '${order.type}',
            '${order.time_in_force}',
            ${order.qty} ${order.stop_price || order.limit_price ? "," : ""}
            ${order.stop_price ? order.stop_price + "," : ""}
            ${order.limit_price ? order.limit_price : ""}
        where not exists (select 1 from orders where symbol = '${
            position.symbol
        }' AND status = 'new') 
        returning id;
        commit;
    `;
};

export const insertOrder = async (
    order: AlpacaTradeConfig,
    position: PositionConfig,
    orderStatus = OrderStatus.new
): Promise<Order | null> => {
    if (isBacktestingEnv()) {
        return {
            id: 1,
            positionId: position.id,
            symbol: order.symbol,
            status: orderStatus,
            filledQuantity: 0,
            averagePrice: 0,
            stopPrice: order.stop_price || 0,
            limitPrice: order.limit_price || 0,
            side: order.side,
            quantity: order.qty,
            tif: order.time_in_force,
            type: order.type,
        };
    }

    const pool = getConnection();

    const query = getInsertOrdersSql(order, position, orderStatus);

    LOGGER.debug(query);

    const results = ((await pool.query(query)) as any) as QueryResult<any>[];

    if (results.length < 3) {
        return null;
    }

    const result = results[2];

    const rows = result.rows;

    if (!rows || !rows.length) {
        return null;
    }

    return {
        id: rows[0].id,
        positionId: position.id,
        symbol: order.symbol,
        status: orderStatus,
        filledQuantity: 0,
        averagePrice: 0,
        stopPrice: order.stop_price || 0,
        limitPrice: order.limit_price || 0,
        side: order.side,
        quantity: order.qty,
        tif: order.time_in_force,
        type: order.type,
    };
};

const getUpdateOrdersSql = (
    id: string,
    positionQuantity: number,
    price: number,
    status: OrderStatus
) => {
    if (!id) {
        throw new Error("need a client id");
    }
    return `update orders set status = '${status}'
        ${positionQuantity ? ", filled_quantity =" + positionQuantity : ""} 
        ${price ? ", average_price = " + price : ""} 
        where id = ${id};`;
};

export const updateOrder = async (
    order: AlpacaOrder,
    positionQuantity?: string | number,
    price?: string | number
) => {
    const pool = getConnection();

    const query = getUpdateOrdersSql(
        order.client_order_id,
        Math.abs(Number(positionQuantity)),
        Number(price),
        order.status
    );

    LOGGER.debug(query);

    try {
        const result = await pool.query(query);
        LOGGER.trace(result);
    } catch (e) {
        LOGGER.error(e);
    }
};

export const getOrder = async (id: number): Promise<Order | null> => {
    const pool = getConnection();

    const query = `select * from orders where id = ${Number(id)}`;

    try {
        const result = await pool.query(query);
        if (result.rowCount !== 1) {
            throw new Error("Couldnt find order for " + id);
        }

        const order: OrderDb = result.rows[0];

        return {
            id,
            positionId: order.position_id,
            symbol: order.symbol,
            filledQuantity: order.filled_quantity,
            stopPrice: order.stop_price,
            limitPrice: order.limit_price,
            side: order.side as TradeDirection,
            status: order.status as OrderStatus,
            tif: order.tif as TimeInForce,
            type: order.type as TradeType,
            quantity: order.quantity,
        };
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};

export const getOpenOrders = async (symbol: string): Promise<OrderDb[]> => {
    const pool = getConnection();

    const query = `select * from orders where symbol = '${symbol}' and status='new';`;

    try {
        const result = await pool.query(query);
        if (result.rowCount < 1) {
            return [];
        }

        return result.rows;
    } catch (e) {
        LOGGER.error(e);
    }

    return [];
};

export const cancelAllOrdersForSymbol = async (symbol: string) => {
    const pool = getConnection();

    const query = `update orders set status = 'canceled' where symbol = '${symbol}' and status='new';`;

    try {
        const result = await pool.query(query);
        if (result.rowCount < 1) {
            return [];
        }

        return result.rows;
    } catch (e) {
        LOGGER.error(e);
    }

    return [];
};

export const cancelOrder = async (id: number) => {
    const pool = getConnection();

    const query = `update orders set status = 'canceled' where id = ${id} and status='new';`;

    try {
        const result = await pool.query(query);
        if (result.rowCount < 1) {
            return [];
        }

        return result.rows;
    } catch (e) {
        LOGGER.error(e);
    }

    return [];
};
