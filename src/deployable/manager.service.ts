import {
    Service,
    getApiServer,
    messageService,
    getFromService,
    isOwnedByService,
} from "../util/api";
import { TradePlan, TradeConfig, TickBar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import {
    AlpacaStreamingOrderUpdate,
    AlpacaPosition,
    AlpacaOrder,
    OrderStatus,
} from "@neeschit/alpaca-trade-api";
import { Position, getRecentlyUpdatedPositions } from "../resources/position";
import { postEntry, postErrorReplacing } from "../util/slack";
import {
    handlePriceUpdateForPosition,
    refreshPositions,
    positionCache,
    openOrderCache,
    openDbPositionCache,
    handleOrderUpdateForSymbol,
    handleOrderCancellationForSymbol,
    handleOrderReplacement,
    handlePositionEntry,
    handleOrderDeletion,
} from "./manager.handlers";
import { isBacktestingEnv } from "../util/env";

const server = getApiServer(Service.manager);

export interface CurrentState {
    positions: AlpacaPosition[];
    openOrders: AlpacaOrder[];
    openDbPositions: Position[];
    recentlyUpdatedDbPositions: Position[];
}

export const postRequestToManageOpenPosition = async (symbol: string, bar: TickBar) => {
    try {
        return messageService(Service.manager, `/manage_open_position/${symbol}`, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/manage_open_position/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const bar = request.body;

    try {
        await handlePriceUpdateForPosition(symbol, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
});

export const postNewTrade = async (trade: { plan: TradePlan; config: TradeConfig }) => {
    try {
        return messageService(Service.manager, "/trade/" + trade.plan.symbol, trade);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/trade/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    await refreshPositions();

    const currentPositions = positionCache.map((p) => p.symbol);
    const openOrderSymbols = openOrderCache.map(
        (o) => o.symbol && (o.status === OrderStatus.new || o.status === OrderStatus.partial_fill)
    );

    const trade = request.body as { plan: TradePlan; config: TradeConfig };

    const pendingOrders =
        currentPositions.indexOf(symbol) !== -1 || openOrderSymbols.indexOf(symbol) !== -1;

    if (pendingOrders) {
        server.log.error(
            `appears ${symbol} has pending orders:\n ${JSON.stringify(
                pendingOrders
            )}\n preventing new order:\n ${JSON.stringify(trade)}`
        );
        return {
            success: true,
            orderRejected: true,
            currentPosition: currentPositions.indexOf(symbol) !== -1,
            openOrder: openOrderSymbols.indexOf(symbol) !== -1,
        };
    }

    const order = await handlePositionEntry(trade);
    if (order) {
        try {
            await postEntry(trade.plan.symbol, trade.config.t, trade.plan);
        } catch (e) {
            LOGGER.error(
                `Trying to enter ${trade.plan.symbol} at ${new Date()} with ${JSON.stringify(
                    trade.plan
                )}`
            );
        }
    }
    return {
        success: true,
    };
});

const getReplaceOpenTradePayload = (
    trade: { plan: TradePlan; config: TradeConfig },
    order: AlpacaOrder
): ReplaceOpenTradePayload => {
    return {
        trade,
        order,
    };
};

export interface ReplaceOpenTradePayload {
    trade: { plan: TradePlan; config: TradeConfig };
    order: AlpacaOrder;
}

export const replaceOpenTrade = async (
    trade: { plan: TradePlan; config: TradeConfig },
    order: AlpacaOrder
) => {
    try {
        return messageService(
            Service.manager,
            "/replace_trade/" + trade.plan.symbol,
            getReplaceOpenTradePayload(trade, order)
        );
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/replace_trade/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    const { trade, order } = request.body as ReplaceOpenTradePayload;

    let replacedOrder = await handleOrderReplacement(trade, order);

    if (!replacedOrder) {
        server.log.error(`could not replace order`);

        await new Promise((resolve) => setTimeout(() => resolve(), 2000));

        replacedOrder = await handleOrderReplacement(trade, order);

        if (!replacedOrder) {
            postErrorReplacing(order);
        }

        return {
            success: false,
        };
    }

    try {
        await postEntry(trade.plan.symbol, trade.config.t, trade.plan);
    } catch (e) {
        LOGGER.error(
            `Trying to enter ${trade.plan.symbol} at ${new Date()} with ${JSON.stringify(
                trade.plan
            )}`
        );
    }
    return {
        success: true,
    };
});

export const getCachedCurrentState = async (): Promise<CurrentState> => {
    try {
        const state = await getFromService(Service.manager, "/currentState");

        return state as CurrentState;
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        positions: [],
        openDbPositions: [],
        openOrders: [],
        recentlyUpdatedDbPositions: [],
    };
};

server.get(
    "/currentState",
    async (): Promise<CurrentState> => {
        const recentlyUpdatedDbPositions = [];
        try {
            const pos = await getRecentlyUpdatedPositions();
            recentlyUpdatedDbPositions.push(...pos);
        } catch (e) {
            server.log.error(e);
        }
        return {
            positions: positionCache,
            openOrders: openOrderCache,
            openDbPositions: openDbPositionCache,
            recentlyUpdatedDbPositions,
        };
    }
);

export const refreshCachedCurrentState = async (): Promise<CurrentState> => {
    try {
        const state = await getFromService(Service.manager, "/refreshState");

        return state as CurrentState;
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        positions: [],
        openDbPositions: [],
        openOrders: [],
        recentlyUpdatedDbPositions: [],
    };
};

server.get(
    "/refreshState",
    async (): Promise<CurrentState> => {
        const recentlyUpdatedDbPositions = [];
        try {
            await refreshPositions();
            const pos = await getRecentlyUpdatedPositions();
            recentlyUpdatedDbPositions.push(...pos);
        } catch (e) {
            server.log.error(e);
        }
        return {
            positions: positionCache,
            openOrders: openOrderCache,
            openDbPositions: openDbPositionCache,
            recentlyUpdatedDbPositions,
        };
    }
);

export const postOrderToManage = async (orderUpdate: AlpacaStreamingOrderUpdate) => {
    try {
        return messageService(Service.manager, "/orders/" + orderUpdate.order.symbol, orderUpdate);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/orders/:symbol", async (request) => {
    const orderUpdate: AlpacaStreamingOrderUpdate = request.body;
    const symbol = request.params && request.params.symbol;

    LOGGER.debug(`Detected a request for ${symbol}`);

    try {
        await handleOrderUpdateForSymbol(orderUpdate);
    } catch (e) {
        server.log.error(e);
    }
});

export const postCancelledOrderToManage = async (orderUpdate: AlpacaStreamingOrderUpdate) => {
    try {
        return messageService(
            Service.manager,
            "/order_cancellation/" + orderUpdate.order.symbol,
            orderUpdate
        );
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/order_cancellation/:symbol", async (request) => {
    const orderUpdate: AlpacaStreamingOrderUpdate = request.body;
    const symbol = request.params && request.params.symbol;

    LOGGER.debug(`Detected a request for ${symbol}`);

    try {
        await handleOrderCancellationForSymbol(orderUpdate);
    } catch (e) {
        server.log.error(e);
    }
});

export const postOrderToCancel = async (order: AlpacaOrder) => {
    try {
        return messageService(Service.manager, "/orders/" + order.symbol, order);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/order_delete/:symbol", async (request) => {
    const order: AlpacaOrder = request.body;
    const symbol = request.params && request.params.symbol;

    LOGGER.debug(`Detected a request for ${symbol}`);

    try {
        await handleOrderDeletion(order);
    } catch (e) {
        server.log.error(e);
    }
});

if (process.env.NODE_ENV !== "test" && isOwnedByService(Service.manager) && !isBacktestingEnv()) {
    refreshPositions().catch(LOGGER.error);
}
