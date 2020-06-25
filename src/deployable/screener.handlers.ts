import { LOGGER } from "../instrumentation/log";
import { Bar, OrderStatus } from "../data/data.model";
import {
    NarrowRangeBarStrategy,
    isTimeToCancelPendingOrbOrders,
    getOrbDirection,
} from "../strategy/narrowRangeBar";
import { getCachedCurrentState, CurrentState, postOrderToCancel } from "./manager.service";
import { getBarsFromDataService } from "./data.service";
import { alpaca } from "../resources/alpaca";
import { getUncachedManagerForPosition } from "./manager.handlers";
import { isSameDay } from "date-fns";
import { Position } from "../resources/position";
import { AlpacaOrder } from "@neeschit/alpaca-trade-api";

export const screenSymbol = async (
    strategies: NarrowRangeBarStrategy[],
    symbol: string,
    bar: Bar,
    currentEpoch = Date.now()
) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const {
        positions,
        recentlyUpdatedDbPositions,
        openOrders,
    }: CurrentState = await getCachedCurrentState();

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
    lastBar: Bar
) => {
    const { positions, openOrders, recentlyUpdatedDbPositions } = await getCachedCurrentState();
    const openingPositionOrders = openOrders.filter(
        (o) =>
            o.symbol === symbol &&
            positions.every((p) => p.symbol !== o.symbol) &&
            o.status !== OrderStatus.pending_cancel
    );

    if (!openingPositionOrders.length) {
        return;
    }

    if (openingPositionOrders.length > 1) {
        await Promise.all(openingPositionOrders.map((o) => postOrderToCancel(o)));
        return;
    }

    const order = openingPositionOrders[0];

    if (isTimeToCancelPendingOrbOrders(Date.now())) {
        postOrderToCancel(order);
        return;
    }

    try {
        const newTrade = refreshTrade(symbol, strategy, recentlyUpdatedDbPositions, order, lastBar);

        if (newTrade) {
            LOGGER.error(
                `canceling order as direction appears to be reversed for ${symbol} at ${new Date().toISOString()}`
            );
            postOrderToCancel(order);
            return {
                trade: newTrade,
                orderToReplace: order,
            };
        }
    } catch (e) {
        LOGGER.error(e);
    }
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

    return manager.refreshPlan(screenerData, strategy.atr, strategy.closePrice, order, lastBar);
};
