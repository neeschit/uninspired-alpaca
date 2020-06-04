import { TradePlan, FilledTradeConfig } from "../data/data.model";
import { getConnection } from "../connection/pg";
import { LOGGER } from "../instrumentation/log";
import { Order, updateOrder } from "./order";
import { isBacktestingEnv } from "../util/env";
import { AlpacaStreamingOrderUpdate } from "@neeschit/alpaca-trade-api";

export interface PositionConfig extends TradePlan {
    id: number;
    originalQuantity: number;
    pendingOrders?: Order[];
}

export interface FilledPositionConfig extends PositionConfig {
    trades: FilledTradeConfig[];
    averageEntryPrice?: number;
}

export interface ClosedPositionConfig extends FilledPositionConfig {
    pnl: number;
}

export const getCreatePositionsTableSql = () => `create table positions (
    id serial primary key,
    planned_stop_price numeric not null,
    planned_entry_price numeric not null,
    symbol varchar(8) not null,
    side varchar(8) not null,
    planned_quantity smallint not null,
    quantity smallint,
    average_entry_price numeric,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

create index positions_symbol_idx on positions (symbol);
create index positions_side_idx on positions (side);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON positions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

`;

export interface Position {
    id: number;
    planned_stop_price: number;
    planned_entry_price: number;
    symbol: string;
    side: string;
    planned_quantity: number;
    quantity: number;
    average_entry_price: number;
}

const getUnfilledPositionInsert = (position: TradePlan) => {
    return `
        insert into positions values (
            DEFAULT,
            ${position.plannedStopPrice}, 
            ${position.plannedEntryPrice}, 
            '${position.symbol}', 
            '${position.side}', 
            ${position.quantity},
            0,
            DEFAULT,
            DEFAULT,
            DEFAULT
        ) returning id;
    `;
};

const getUnfilledPositionUpdate = (position: TradePlan, id: number) => {
    return `
        update positions set 
            planned_stop_price = ${position.plannedStopPrice}, 
            planned_entry_price = ${position.plannedEntryPrice}, 
            side = '${position.side}', 
            quantity = 0
        where id = ${id};
    `;
};

export const mapPlanToUnfilledPosition = (plan: TradePlan): PositionConfig => {
    return {
        ...plan,
        quantity: 0,
        originalQuantity: plan.quantity,
        id: 1,
    };
};

export const insertPlannedPosition = async (plan: TradePlan): Promise<PositionConfig> => {
    if (isBacktestingEnv()) {
        return mapPlanToUnfilledPosition(plan);
    }
    const pool = getConnection();

    const query = getUnfilledPositionInsert(plan);

    const result = await pool.query(query);

    const rows = result.rows;

    return {
        ...plan,
        quantity: 0,
        originalQuantity: 0,
        id: rows[0].id,
    };
};

export const updatePlannedPosition = async (
    plan: TradePlan,
    id: number
): Promise<PositionConfig> => {
    const query = getUnfilledPositionUpdate(plan, id);
    if (isBacktestingEnv()) {
        LOGGER.debug(query);
        return mapPlanToUnfilledPosition(plan);
    }
    const pool = getConnection();

    const result = await pool.query(query);

    return {
        ...plan,
        quantity: 0,
        originalQuantity: 0,
        id,
    };
};

export const getPosition = async (id: number): Promise<Position> => {
    if (!id) {
        throw new Error("No position id");
    }
    const pool = getConnection();

    const result = await pool.query(`
        select * from positions where id=${id}
    `);

    return result.rows[0];
};

export const getOpenPositions = async (): Promise<Position[]> => {
    const pool = getConnection();

    const result = await pool.query(`
        select * from positions where quantity > 0
    `);

    return result.rows;
};

export const getRecentlyUpdatedPositions = async (): Promise<Position[]> => {
    const pool = getConnection();

    const result = await pool.query(`
        select * from positions where quantity = 0 AND updated_at > NOW() - INTERVAL '60 minutes' order by updated_at desc limit 30;
    `);

    return result.rows;
};

const updatePositionSql = (quantity: number, id: number, price?: number) => {
    return `
    update positions set quantity=${Math.abs(Number(quantity))} ${
        price ? ", average_entry_price=" + price : ""
    } where id=${id};
`;
};

export const getUpdatePositionQuery = (
    originalPosition: Position,
    quantity: number,
    price?: number
) => {
    if (!originalPosition.quantity) {
        return updatePositionSql(quantity, originalPosition.id, price);
    }

    return updatePositionSql(quantity, originalPosition.id);
};

export const updatePosition = async (
    originalPosition: Position,
    orderUpdate: AlpacaStreamingOrderUpdate
) => {
    if (!originalPosition) {
        throw new Error("No position");
    }
    const pool = getConnection();

    const query = getUpdatePositionQuery(
        originalPosition,
        orderUpdate.position_qty,
        orderUpdate.price
    );

    const result = await pool.query(query);

    await updateOrder(orderUpdate.order, orderUpdate.position_qty, orderUpdate.price).catch(
        LOGGER.error
    );

    return result;
};

export const forceUpdatePosition = async (
    originalPosition: Position,
    quantity: number,
    price?: number
) => {
    if (!originalPosition) {
        throw new Error("No position");
    }
    const pool = getConnection();

    const query = updatePositionSql(quantity, originalPosition.id, price);

    const result = await pool.query(query);

    return result;
};
