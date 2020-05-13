import { Service, getApiServer, messageService, getFromService } from "../util/api";
import { TradePlan, TradeConfig, TickBar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import {
    AlpacaStreamingOrderUpdate,
    AlpacaPosition,
    AlpacaOrder,
} from "@neeschit/alpaca-trade-api";
import { Position } from "../resources/position";
import { postEntry } from "../util/slack";
import {
    manageOpenOrder,
    handlePriceUpdateForPosition,
    refreshPositions,
    positionCache,
    openOrderCache,
    dbPositionCache,
    handleOrderUpdateForSymbol,
    handlePositionEntry,
} from "./manager.handlers";

const server = getApiServer(Service.manager);

export interface CurrentState {
    positions: AlpacaPosition[];
    openOrders: AlpacaOrder[];
    dbPositions: Position[];
}

export const postRequestToManageOpenPosition = (symbol: string, bar: TickBar) => {
    return messageService(Service.manager, `/manage_open_position/${symbol}`, bar);
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

export const postRequestToManageOpenOrders = (symbol: string, bar: TickBar) => {
    return messageService(Service.manager, `/manage_open_order/${symbol}`, bar);
};

server.post("/manage_open_order/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    await manageOpenOrder(symbol);

    return {
        success: true,
    };
});

export const postNewTrade = (trade: { plan: TradePlan; config: TradeConfig }) => {
    return messageService(Service.manager, "/trade/" + trade.plan.symbol, trade);
};

server.post("/trade/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    const currentPositions = positionCache.map((p) => p.symbol);
    const openOrderSymbols = openOrderCache.map((o) => o.symbol);

    const trade = request.body as { plan: TradePlan; config: TradeConfig };

    const pendingOrders =
        currentPositions.indexOf(symbol) !== -1 || openOrderSymbols.indexOf(symbol) !== -1;

    if (pendingOrders) {
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

export const getCachedCurrentState = async (): Promise<CurrentState> => {
    const state = await getFromService(Service.manager, "/currentState");

    return state as CurrentState;
};

server.get("/currentState", async () => {
    return {
        positions: positionCache,
        openOrders: openOrderCache,
        dbPositions: dbPositionCache,
    };
});

export const postOrderToManage = async (orderUpdate: AlpacaStreamingOrderUpdate) => {
    return messageService(Service.manager, "/orders/" + orderUpdate.order.symbol, orderUpdate);
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

refreshPositions().catch(LOGGER.error);