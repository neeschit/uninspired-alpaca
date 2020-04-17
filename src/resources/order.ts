import { getConnection } from "../connection/pg";
import { AlpacaTradeConfig, TradeType } from "@neeschit/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { PositionConfig } from "./position";
import { TimeInForce, OrderStatus, TradeDirection } from "../data/data.model";


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

export const getCreateOrdersTableSql = () => `create table orders (
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
    alpaca_order_info jsonb
);

create index orders_symbol_idx on orders (symbol);
create index orders_side_idx on orders (side);
create index orders_status_idx on orders (status);

`;

const getInsertOrdersSql = (order: AlpacaTradeConfig, position: PositionConfig, orderStatus: OrderStatus) => {
    return `
        insert into orders values (
            DEFAULT,
            ${position.id}, 
            '${position.symbol}', 
            '${orderStatus}', 
            '${order.side}', 
            '${order.type}',
            '${order.time_in_force}',
            ${order.qty},
            ${order.stop_price || 'DEFAULT'},
            ${order.limit_price || 'DEFAULT'},
            DEFAULT,
            DEFAULT,
            DEFAULT
        ) returning id;
    `;
}

export const insertOrder = async (order: AlpacaTradeConfig, position: PositionConfig, orderStatus: OrderStatus): Promise<Order> => {
    const pool = getConnection();

    const query = getInsertOrdersSql(order, position, orderStatus);

    const result = await pool.query(query);

    const rows = result.rows;

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
        type: order.type
    };
}