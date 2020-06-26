import { LOGGER } from "../instrumentation/log";
import { Bar } from "../data/data.model";
import {
    NarrowRangeBarStrategy,
    isTimeToCancelPendingOrbOrders,
    getOrbDirection,
} from "../strategy/narrowRangeBar";
import { isSameDay } from "date-fns";
import { Position } from "../resources/position";
import { AlpacaOrder, OrderStatus } from "@neeschit/alpaca-trade-api";
import { TradeManagement } from "../services/tradeManagement";
import { CurrentState, getUncachedManagerForPosition } from "./manager.interfaces";
import { getBarsFromDataService } from "./data.interfaces";

export const screenSymbol = async (
    strategies: NarrowRangeBarStrategy[],
    symbol: string,
    bar: Bar,
    cachedCurrentState: CurrentState,
    currentEpoch = Date.now()
) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const { positions, recentlyUpdatedDbPositions, openOrders } = cachedCurrentState;

    if (recentlyUpdatedDbPositions.some((p) => p.symbol === symbol && p.average_entry_price)) {
        return null;
    }

    if (openOrders.some((o) => o.symbol === symbol)) {
        return null;
    }

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const screenerData = await getTodaysBars(symbol, currentEpoch);

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.screenForEntry(screenerData, currentEpoch, bar, positions);
};

export const manageOpenOrder = async (
    symbol: string,
    strategy: NarrowRangeBarStrategy,
    lastBar: Bar,
    cachedCurrentState: CurrentState
) => {
    const { positions, openOrders, recentlyUpdatedDbPositions } = cachedCurrentState;
    const openingPositionOrders = openOrders.filter(
        (o) =>
            o.symbol === symbol &&
            positions.every((p) => p.symbol !== o.symbol) &&
            o.status !== OrderStatus.pending_cancel
    );

    if (!openingPositionOrders.length) {
        return null;
    }

    if (openingPositionOrders.length > 1) {
        return openingPositionOrders;
    }

    const order = openingPositionOrders[0];

    if (isTimeToCancelPendingOrbOrders(Date.now())) {
        return [order];
    }

    try {
        const newTrade = refreshTrade(symbol, strategy, recentlyUpdatedDbPositions, order, lastBar);

        if (newTrade) {
            LOGGER.error(
                `canceling order as direction appears to be reversed for ${symbol} at ${new Date().toISOString()}`
            );
            return [order];
        }
    } catch (e) {
        LOGGER.error(e);
    }
    return null;
};

export const getTodaysBars = async (symbol: string, currentEpoch = Date.now()) => {
    const screenerData: Bar[] = await getBarsFromDataService(symbol, currentEpoch);

    return screenerData.filter((b) => isSameDay(b.t, currentEpoch));
};

export const refreshTrade = async (
    symbol: string,
    strategy: NarrowRangeBarStrategy,
    recentlyUpdatedDbPositions: Position[],
    order: AlpacaOrder,
    lastBar: Bar
) => {
    const screenerData = await getTodaysBars(symbol);
    const manager = getUncachedManagerForPosition(recentlyUpdatedDbPositions, symbol);

    if (!manager) {
        return;
    }

    return _refreshTrade(strategy, order, lastBar, screenerData, manager);
};

export const _refreshTrade = async (
    strategy: NarrowRangeBarStrategy,
    order: AlpacaOrder,
    lastBar: Bar,
    screenerData: Bar[],
    manager: TradeManagement
) => {
    return manager.refreshPlan(screenerData, strategy.atr, strategy.closePrice, order, lastBar);
};
