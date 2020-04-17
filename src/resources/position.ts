import { TradePlan, FilledTradeConfig } from "../data/data.model";
import { getConnection } from "../connection/pg";
import { LOGGER } from "../instrumentation/log";
import { Order } from "./order";


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
    average_entry_price numeric
);

create index positions_symbol_idx on positions (symbol);
create index positions_side_idx on positions (side);

`;

const getUnfilledPositionInsert = (position: TradePlan) => {
    return `
        insert into positions values (
            DEFAULT,
            ${position.plannedStopPrice}, 
            ${position.plannedEntryPrice}, 
            '${position.symbol}', 
            '${position.side}', 
            ${position.quantity},
            DEFAULT,
            DEFAULT
        ) returning id;
    `;
};

export const insertPlannedPosition = async (plan: TradePlan): Promise<PositionConfig> => {
    const pool = getConnection();

    const query = getUnfilledPositionInsert(plan);

    LOGGER.info(query);

    const result = await pool.query(query);

    const rows = result.rows;

    return {
        ...plan,
        quantity: 0,
        originalQuantity: 0,
        id: rows[0].id
    }
};
