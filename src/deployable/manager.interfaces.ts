import {
    AlpacaPosition,
    AlpacaOrder,
    PositionDirection,
    AlpacaStreamingOrderUpdate,
} from "@neeschit/alpaca-trade-api";
import { Position, PositionConfig } from "../resources/position";
import { LOGGER } from "../instrumentation/log";
import { TradeManagement } from "../services/tradeManagement";
import { TradeConfig, TradePlan, TickBar } from "../data/data.model";
import { messageService, Service, getFromService } from "../util/api";

export const CURRENT_PROFIT_RATIO = 3;

export interface CurrentState {
    positions: AlpacaPosition[];
    openOrders: AlpacaOrder[];
    openDbPositions: Position[];
    recentlyUpdatedDbPositions: Position[];
}

export const getUncachedManagerForPosition = (openDbPositionCache: Position[], symbol: string) => {
    const position = openDbPositionCache.find((p) => p.symbol === symbol);

    if (!position) {
        LOGGER.error(`aww hell`);
        return null;
    }
    const unfilledPosition: PositionConfig = {
        id: position.id,
        plannedEntryPrice: position.planned_entry_price,
        plannedStopPrice: position.planned_stop_price,
        riskAtrRatio: 1,
        side: position.side as PositionDirection,
        quantity: position.planned_quantity,
        symbol,
        originalQuantity: position.planned_quantity,
    };
    const manager = new TradeManagement({} as TradeConfig, unfilledPosition, CURRENT_PROFIT_RATIO);
    manager.position = {
        ...unfilledPosition,
    };
    manager.filledPosition = {
        ...unfilledPosition,
        originalQuantity: position.planned_quantity,
        quantity: position.quantity,
        averageEntryPrice: position.average_entry_price,
        trades: [],
    };
    return manager;
};

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

export const postOrderToCancel = async (order: AlpacaOrder) => {
    try {
        return messageService(Service.manager, "/order_delete/" + order.symbol, order);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

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

export const getReplaceOpenTradePayload = (
    trade: { plan: TradePlan; config: TradeConfig },
    order: AlpacaOrder
): ReplaceOpenTradePayload => {
    return {
        trade,
        order,
    };
};

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
