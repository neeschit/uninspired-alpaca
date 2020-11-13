import { PositionDirection } from "@neeschit/alpaca-trade-api";
import { getConnection } from "../../src/connection/pg";
import {
    TimestampedRecord,
    ensureUpdateTriggerExists,
} from "../schema-helpers";

export interface TradePlan {
    stop: number;
    limit_price: number;
    entry: number;
    target: number;
    quantity: number;
    side: PositionDirection;
    symbol: string;
}

export interface PersistedTradePlan extends TradePlan, TimestampedRecord {}

export const getCreatePositionsTableSql = () => `
${ensureUpdateTriggerExists}

create table trade_plan (
    id serial primary key,
    limit_price numeric not null,
    target numeric not null,
    entry numeric not null,
    stop numeric not null,
    quantity smallint not null,
    symbol varchar(8) not null,
    side varchar(8) not null,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

create index trade_plan_symbol_idx on trade_plan (symbol);
create index trade_plan_side_idx on trade_plan (side);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON trade_plan
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

`;

const getUnfilledPositionInsert = (plan: TradePlan) => {
    return `
        insert into trade_plan values (
            DEFAULT,
            ${plan.limit_price},
            ${plan.target},
            ${plan.entry},
            ${plan.stop},
            ${Math.abs(plan.quantity)},
            '${plan.symbol}',
            '${plan.side}',
            DEFAULT,
            DEFAULT
        ) returning *;
    `;
};

export const persistTradePlan = async (
    plan: TradePlan
): Promise<PersistedTradePlan> => {
    const pool = getConnection();

    const query = getUnfilledPositionInsert(plan);

    const result = await pool.query(query);

    const rows = result.rows;

    return rows[0];
};
