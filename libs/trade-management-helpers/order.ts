import {
    AlpacaOrder,
    AlpacaTradeConfig,
    Calendar,
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { getConnection } from "../core-utils/connection/pg";
import { TimestampedRecord } from "../schema-helpers/model";
import { ensureUpdateTriggerExists } from "../schema-helpers/updated_at.trigger";
import { persistTradePlan, TradePlan, PersistedTradePlan } from "./position";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getData } from "../core-utils/resources/stockData";
import { getMarketOpenMillis } from "../simulation-helpers/timing.util";

export interface OrderUpdate extends AlpacaOrder {
    position_id: number;
    position_qty: number;
}

export const getRecentOrders = async (
    symbol: string
): Promise<PersistedUnfilledOrder[]> => {
    const getRecentOrders = `select * from new_order where symbol = '${symbol.toLocaleLowerCase()}' and created_at >= NOW() - INTERVAL '3 seconds';`;

    const connection = getConnection();

    const recentOrdersQueryResult = await connection.query(getRecentOrders);

    if (!recentOrdersQueryResult.rowCount) {
        return [];
    }

    return recentOrdersQueryResult.rows;
};

export const createOrderSynchronized = async (
    plan: TradePlan,
    broker: BrokerStrategy
): Promise<AlpacaOrder> => {
    const openOrders = await broker.getOpenOrders();
    console.log(openOrders);

    const openOrderForSymbol = openOrders.filter(
        (o) => o.symbol === plan.symbol
    );

    if (openOrderForSymbol.length) {
        const existingAlpacaOrder = openOrderForSymbol[0];

        const expectedOrderDirection =
            plan.side === PositionDirection.long
                ? TradeDirection.buy
                : TradeDirection.sell;

        if (expectedOrderDirection === existingAlpacaOrder.side) {
            throw new Error("order_exists");
        }

        const positions = await broker.getOpenPositions();

        if (positions.some((p) => p.symbol === plan.symbol)) {
            throw new Error("position_exists");
        }

        await broker.cancelAlpacaOrder(existingAlpacaOrder.id);
    }

    const { persistedPlan, order } = await persistPlanAndOrder(plan);

    return createAlpacaOrder(persistedPlan, order, broker);
};

export const persistPlanAndOrder = async (plan: TradePlan) => {
    if (process.env.NODE_ENV === "backtest") {
        const persistedPlan = {
            ...plan,
            id: Date.now() + Math.random(),
            created_at: "",
            updated_at: "",
        };
        const unfilledOrder = getOpeningOrderForPlan(persistedPlan);
        return {
            persistedPlan: persistedPlan,
            order: {
                ...unfilledOrder,
                id: Date.now() + Math.random(),
                created_at: "",
                updated_at: "",
            },
        };
    }

    const recentOrdersForSymbol = await getRecentOrders(plan.symbol);

    if (recentOrdersForSymbol.length) {
        throw new Error("order_placed_recently_for_symbol");
    }

    const persistedPlan = await persistTradePlan(plan);

    const order = await insertOrderForTradePlan(persistedPlan);

    if (!order) {
        throw new Error("order_insertion_failed");
    }

    return { persistedPlan, order };
};

async function createAlpacaOrder(
    persistedPlan: PersistedTradePlan,
    order: PersistedUnfilledOrder,
    broker: BrokerStrategy
) {
    let alpacaOrder: AlpacaOrder;

    const bracketOrder = convertPlanToAlpacaBracketOrder(persistedPlan, order);
    try {
        alpacaOrder = await broker.createBracketOrder(bracketOrder);
    } catch (e) {
        await updateOrderWithAlpacaId(
            order.id,
            "brokerage_failure" + Date.now()
        );
        throw new Error("error placing order - " + order.id + "- " + e.message);
    }

    await updateOrderWithAlpacaId(order.id, alpacaOrder.id);

    return alpacaOrder;
}

const unplacedAlpacaOrderId = "new";

export const selectAllNewOrders = async (symbol: string) => {
    const selectAllNewOrdersQuery = `select * from new_order where alpaca_order_id = '${unplacedAlpacaOrderId}' and symbol = '${symbol.toLowerCase()}'`;
    const connection = getConnection();

    const result = await connection.query(selectAllNewOrdersQuery);

    if (!result.rowCount) {
        return null;
    }

    return result.rows;
};

const updateQuery = (id: number, alpaca_order_id: string) => {
    return `
        begin;
        update new_order set (alpaca_order_id) = ROW('${alpaca_order_id}')
            where id = ${id}; 
        commit;
    `;
};

export const updateOrderWithAlpacaId = async (
    id: number,
    alpaca_order_id: string
) => {
    const connection = getConnection();

    const query = updateQuery(id, alpaca_order_id);

    try {
        await connection.query(query);
    } catch (e) {
        console.error("error_updating_order", e);
        console.error(query);

        await connection.query(
            updateQuery(id, "unknown_failure_" + Date.now())
        );
    }
};

const selectQueryById = (id: number) =>
    `select * from new_order where id = ${id} limit 1;`;

export const getOrderById = async (id: number) => {
    const connection = getConnection();
    const query = selectQueryById(id);

    const result = await connection.query(query);

    if (!result || !result.rowCount) {
        return null;
    }

    return result.rows[0];
};

const getInsertQuery = (order: UnfilledOrder) => {
    return `insert into new_order values(
        DEFAULT,
        ${order.trade_plan_id},
        '${order.symbol.toLowerCase()}',
        '${order.side}',
        '${order.type}',
        '${order.tif}',
        ${order.quantity},
        ${order.limit_price},
        (
            ${order.bracket.stop_loss}, 
            ${order.bracket.target}, 
            ${order.bracket.stop_limit || null}
        ),
        ${order.stop_price || "DEFAULT"},
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) ON CONFLICT DO NOTHING returning *;`;
};

export const getOpeningOrderForPlan = (plan: PersistedTradePlan) => {
    const type =
        plan.entry === plan.limit_price
            ? TradeType.limit
            : TradeType.stop_limit;

    return {
        trade_plan_id: plan.id,
        stop_price: type === TradeType.limit ? undefined : plan.entry,
        limit_price: plan.limit_price,
        bracket: {
            stop_loss: plan.stop,
            target: plan.target,
        },
        symbol: plan.symbol,
        side:
            plan.side === PositionDirection.short
                ? TradeDirection.sell
                : TradeDirection.buy,
        tif: TimeInForce.day,
        type,
        quantity: plan.quantity,
    };
};

export const insertOrderForTradePlan = async (
    plan: PersistedTradePlan
): Promise<PersistedUnfilledOrder | null> => {
    "insert " + Date.now();
    const unfilledOrder = getOpeningOrderForPlan(plan);

    const connection = getConnection();

    try {
        const insertQuery = getInsertQuery(unfilledOrder);

        const result = await connection.query(insertQuery);

        if (result.rows) {
            return result.rows[0] as PersistedUnfilledOrder;
        }
    } catch (e) {
        console.error("error inserting new order - ", e);
    }

    return null;
};

export const convertPlanToAlpacaBracketOrder = (
    plan: TradePlan,
    order: PersistedUnfilledOrder
): AlpacaTradeConfig => {
    const order_class = "bracket";

    return {
        order_class,
        client_order_id: order.id.toString(),
        symbol: plan.symbol,
        stop_loss: {
            stop_price: plan.stop,
        },
        take_profit: {
            limit_price: plan.target,
        },
        stop_price: order.stop_price,
        limit_price: plan.limit_price,
        type: order.type,
        time_in_force: TimeInForce.day,
        side: order.side,
        extended_hours: false,
        qty: Math.abs(plan.quantity),
    };
};

export interface UnfilledOrder {
    trade_plan_id: number;
    symbol: string;
    side: TradeDirection;
    type: TradeType;
    tif: TimeInForce;
    quantity: number;
    limit_price: number;
    stop_price?: number;
    alpaca_order_id?: string;
    bracket: {
        stop_loss: number;
        target: number;
        stop_limit?: number;
    };
}

export const deleteOrder = async (id: number) => {
    const query = `delete from new_order where id = ${id}`;

    const connection = getConnection();

    await connection.query(query);
};

export interface PersistedUnfilledOrder
    extends UnfilledOrder,
        TimestampedRecord {}

export const cancelOpenOrdersForSymbol = async (
    symbol: string,
    broker: BrokerStrategy
) => {
    const openOrders = await broker.getOpenOrders();
    const ordersForSymbol = openOrders.filter((o) => o.symbol === symbol);

    if (!ordersForSymbol.length) {
        return null;
    }

    await broker.cancelAlpacaOrder(ordersForSymbol[0].id);

    return null;
};

export const getCreateUnfilledOrdersTableSql = () => `
${ensureUpdateTriggerExists}

create type bracket_order_legs as ( 
    stop_loss numeric, 
    target numeric, 
    stop_limit integer 
);

create table new_order (
    id serial primary key,
    trade_plan_id integer references trade_plan(id),
    symbol varchar(8) not null,
    side varchar(8) not null,
    type text not null,
    tif varchar(6) not null,
    quantity smallint not null,
    limit_price numeric not null,
    bracket bracket_order_legs,
    stop_price numeric,
    alpaca_order_id text default '${unplacedAlpacaOrderId}',
    leg_client_order_ids text[] DEFAULT array[]::varchar[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(symbol, alpaca_order_id)
);

create index new_order_symbol_idx on new_order (symbol);
create index new_order_side_idx on new_order (side);
create index new_order_trade_plan_id_idx on new_order (trade_plan_id);
create index new_order_alpaca_order_id_idx on new_order (alpaca_order_id);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON new_order
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`;
