import {
    AlpacaOrder,
    AlpacaTradeConfig,
    Calendar,
    OrderStatus,
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

export interface OrderUpdate extends AlpacaOrder {
    position_id: number;
    position_qty: number;
}

export const getRecentOrders = async (
    symbol: string
): Promise<PersistedUnfilledOrder[]> => {
    const getRecentOrders = `select * from new_order where symbol = '${symbol}' and created_at >= NOW() - INTERVAL '3 seconds';`;

    const connection = getConnection();

    const recentOrdersQueryResult = await connection.query(getRecentOrders);

    if (!recentOrdersQueryResult.rowCount) {
        return [];
    }

    return recentOrdersQueryResult.rows;
};

export const createOrderSynchronized = async (
    plan: TradePlan,
    unfilledOrder: UnfilledOrder,
    broker: BrokerStrategy
) => {
    const openOrders = await broker.getOpenOrders();

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

    const persistedPlan = await persistPlan(plan);

    const alpacaOrder = await persistAndCreateAlpacaOrder(
        persistedPlan,
        {
            ...unfilledOrder,
            trade_plan_id: persistedPlan.id,
        },
        broker
    );

    return {
        persistedPlan,
        alpacaOrder,
    };
};

export const persistPlan = async (plan: TradePlan) => {
    if (process.env.NODE_ENV === "backtest") {
        const persistedPlan = {
            ...plan,
            id: Date.now() + Math.random(),
            created_at: "",
            updated_at: "",
        };
        return persistedPlan;
    }
    const persistedPlan = await persistTradePlan(plan);
    return persistedPlan;
};

export const persistOrderForPlan = async (
    persistedPlan: PersistedTradePlan,
    unfilledOrder: UnfilledOrderAssociatedWithPlan
) => {
    if (process.env.NODE_ENV === "backtest") {
        const currentDate = new Date().toISOString();
        return {
            ...unfilledOrder,
            id: Date.now() + Math.random(),
            created_at: currentDate,
            updated_at: currentDate,
            status: OrderStatus.new,
        };
    }

    const recentOrdersForSymbol = await getRecentOrders(persistedPlan.symbol);

    if (recentOrdersForSymbol.length) {
        throw new Error("order_placed_recently_for_symbol");
    }

    const order = await insertOrderForTradePlan(persistedPlan, unfilledOrder);

    if (!order) {
        throw new Error("order_insertion_failed");
    }

    order.stop_loss = unfilledOrder.stop_loss;
    order.take_profit = unfilledOrder.take_profit;

    return order;
};

export const persistAndCreateAlpacaOrder = async (
    persistedPlan: PersistedTradePlan,
    unfilledOrder: UnfilledOrderAssociatedWithPlan,
    broker: BrokerStrategy
): Promise<AlpacaOrder> => {
    const order = await persistOrderForPlan(persistedPlan, unfilledOrder);

    return createAlpacaOrderFromPersistedPlanAndOrder(order, broker);
};

async function createAlpacaOrderFromPersistedPlanAndOrder(
    order: PersistedUnfilledOrder,
    broker: BrokerStrategy
) {
    let alpacaOrder: AlpacaOrder;

    const alpacaTradeConfig = convertPersistedOrderToAlpacaOrder(order);

    try {
        if (alpacaTradeConfig.order_class === "bracket") {
            alpacaOrder = await broker.createBracketOrder(alpacaTradeConfig);
        } else if (alpacaTradeConfig.order_class === "oto") {
            alpacaOrder = await broker.createOneTriggersAnotherOrder(
                alpacaTradeConfig
            );
        } else {
            alpacaOrder = await broker.createSimpleOrder(alpacaTradeConfig);
        }
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
    const selectAllNewOrdersQuery = `select * from new_order where alpaca_order_id = '${unplacedAlpacaOrderId}' and symbol = '${symbol}'`;
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

export const getBracketOrderForPlan = (plan: TradePlan): UnfilledOrder => {
    if (!plan.stop || !plan.target) {
        throw new Error("stop_take_profit_required");
    }
    const type =
        plan.entry === -1
            ? TradeType.market
            : plan.entry === plan.limit_price
            ? TradeType.limit
            : plan.limit_price > 0 && plan.entry > 0
            ? TradeType.stop_limit
            : TradeType.stop;

    return {
        stop_price:
            type === TradeType.stop_limit || type === TradeType.stop
                ? plan.entry
                : undefined,
        limit_price: plan.limit_price > 0 ? plan.limit_price : undefined,
        take_profit: {
            limit_price: plan.target,
        },
        stop_loss: {
            stop_price: plan.stop,
        },
        symbol: plan.symbol,
        side:
            plan.side === PositionDirection.short
                ? TradeDirection.sell
                : TradeDirection.buy,
        tif: TimeInForce.day,
        type,
        quantity: Math.abs(plan.quantity),
        order_class: "bracket" as any,
    };
};

export const insertOrderForTradePlan = async (
    plan: PersistedTradePlan,
    unfilledOrder: UnfilledOrder
): Promise<PersistedUnfilledOrder | null> => {
    "insert " + Date.now();
    const connection = getConnection();

    try {
        const insertQuery = getInsertQuery({
            ...unfilledOrder,
            trade_plan_id: plan.id,
        });

        const result = await connection.query(insertQuery);

        if (result.rows) {
            return result.rows[0] as PersistedUnfilledOrder;
        }
    } catch (e) {
        console.error("error inserting new order - ", e);
    }

    return null;
};

export const convertPersistedOrderToAlpacaOrder = (
    order: PersistedUnfilledOrder
): AlpacaTradeConfig => {
    return {
        order_class: order.order_class,
        client_order_id: order.id.toString(),
        symbol: order.symbol,
        stop_loss: order.stop_loss,
        take_profit: order.take_profit,
        stop_price: order.stop_price === -1 ? undefined : order.stop_price,
        limit_price: order.limit_price === -1 ? undefined : order.limit_price,
        type: order.type,
        time_in_force: order.tif,
        side: order.side,
        extended_hours: false,
        qty: Math.abs(order.quantity),
    };
};

export interface UnfilledOrder {
    symbol: string;
    side: TradeDirection;
    type: TradeType;
    tif: TimeInForce;
    quantity: number;
    limit_price?: number;
    stop_price?: number;
    alpaca_order_id?: string;
    order_class: "simple" | "bracket" | "oco" | "oto";
    take_profit?: {
        limit_price: number;
    };
    stop_loss?: {
        stop_price: number;
        limit_price?: number;
    };
}

export interface UnfilledOrderAssociatedWithPlan extends UnfilledOrder {
    trade_plan_id: number;
}

export const deleteOrder = async (id: number) => {
    const query = `delete from new_order where id = ${id}`;

    const connection = getConnection();

    await connection.query(query);
};

export interface PersistedUnfilledOrder
    extends UnfilledOrderAssociatedWithPlan,
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

const getInsertQuery = (order: UnfilledOrderAssociatedWithPlan) => {
    return `insert into new_order values(
        DEFAULT,
        ${order.trade_plan_id},
        '${order.symbol}',
        '${order.side}',
        '${order.type}',
        '${order.tif}',
        ${order.quantity},
        ${order.limit_price || "DEFAULT"},
        ${order.stop_price || "DEFAULT"},
        '${order.order_class}',
        ${order.take_profit?.limit_price || null},
        ${order.stop_loss?.stop_price || null},
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) ON CONFLICT DO NOTHING returning *;`;
};

export const getCreateUnfilledOrdersTableSql = () => `
${ensureUpdateTriggerExists}

create table new_order (
    id serial primary key,
    trade_plan_id integer references trade_plan(id),
    symbol varchar(8) not null,
    side varchar(8) not null,
    type text not null,
    tif varchar(6) not null,
    quantity smallint not null,
    limit_price numeric,
    stop_price numeric,
    order_class VARCHAR(20),
    take_profit numeric,
    stop_loss numeric,
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
