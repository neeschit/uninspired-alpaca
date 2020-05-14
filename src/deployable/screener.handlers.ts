import { AlpacaPosition, AlpacaOrder, PositionDirection } from "@neeschit/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { Bar, OrderStatus, TradeConfig } from "../data/data.model";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getCachedCurrentState } from "./manager.service";
import { getBarsFromDataService } from "./data.service";
import { getOrder } from "../resources/order";
import { alpaca } from "../resources/alpaca";
import { getPosition, PositionConfig } from "../resources/position";
import { TradeManagement, validatePositionEntryPlan } from "../services/tradeManagement";
import { getTodaysData } from "../resources/stockData";

export const screenSymbol = async (
    strategies: NarrowRangeBarStrategy[],
    symbol: string,
    currentEpoch = Date.now()
) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const { positions }: { positions: AlpacaPosition[] } = await getCachedCurrentState();

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const screenerData: Bar[] = await getBarsFromDataService(symbol, currentEpoch);

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch, positions);
};

export const manageOpenOrder = async (symbol: string, strategy: NarrowRangeBarStrategy) => {
    const { positions, openOrders } = await getCachedCurrentState();
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
        await Promise.all(openingPositionOrders.map((o) => alpaca.cancelOrder(o.id)));
        return;
    }

    try {
        const order = openingPositionOrders[0];
        const screenerData: Bar[] = await getBarsFromDataService(symbol);
        const isValid = validatePositionEntryPlan(screenerData, order.side, strategy.closePrice);

        if (!isValid) {
            await alpaca.cancelOrder(order.id);
        }
    } catch (e) {
        LOGGER.error(e);
    }
};
