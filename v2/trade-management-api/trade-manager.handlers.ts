import { format } from "date-fns";
import { getWatchlistFromScreenerService } from "../screener-api";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
} from "../strategy/narrowRangeBar";
import { getData } from "../../src/resources/stockData";
import { getMarketOpenMillis } from "../../src/util/market";
import {
    cancelAlpacaOrder,
    getOpenOrders,
    getOpenPositions,
} from "../brokerage-helpers";
import { createOrderSynchronized } from "../trade-management-helpers";
import {
    isBeforeMarketOpening,
    isMarketClosing,
    isMarketOpen,
    isMarketOpening,
    runStrategy,
} from "../simulation-helpers";
import { Calendar } from "@neeschit/alpaca-trade-api";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";

const nrbStrategies: { [index: string]: NarrowRangeBarSimulation } = {};

export const lookForEntry = async (symbol: string, epoch = Date.now()) => {
    const watchlist = await getWatchlistFromScreenerService(
        format(new Date(), "MM-dd-yyyy")
    );

    if (watchlist.every((item) => item.symbol !== symbol)) {
        return null;
    }

    const positions = await getOpenPositions();

    if (positions.some((p) => p.symbol === symbol)) {
        return null;
    }

    if (!isTimeForOrbEntry(epoch)) {
        return cancelOpenOrdersForSymbol(symbol);
    }

    const { data, lastBar } = await getPersistedData(symbol, epoch);

    const { atr } = getAverageTrueRange(data, false);

    const currentAtr = atr!.pop()!.value;

    const plan = getSafeOrbEntryPlan({
        currentAtr,
        marketBarsSoFar: data,
        symbol,
        lastPrice: lastBar.c,
        openingBar: data[0],
        dailyAtr: atr.pop()!.value,
    });

    return plan;
};

export const cancelOpenOrdersForSymbol = async (symbol: string) => {
    const openOrders = await getOpenOrders();
    const ordersForSymbol = openOrders.filter((o) => o.symbol === symbol);

    if (!ordersForSymbol.length) {
        return null;
    }

    await cancelAlpacaOrder(ordersForSymbol[0].id);

    return null;
};

export const rebalanceForSymbol = async (
    symbol: string,
    calendar: Calendar[],
    epoch = Date.now()
) => {
    let sim = nrbStrategies[symbol];

    if (!sim) {
        sim = new NarrowRangeBarSimulation(symbol);

        nrbStrategies[symbol] = sim;
    }

    return runStrategy(symbol, calendar, sim, epoch);
};

export const enterSymbol = async (symbol: string, epoch = Date.now()) => {
    const plan = await lookForEntry(symbol, epoch);

    if (!plan) {
        return null;
    }

    const order = await createOrderSynchronized(plan);

    return order;
};

export async function getPersistedData(symbol: string, epoch: number) {
    const data = await getData(
        symbol,
        getMarketOpenMillis(epoch).getTime(),
        "5 minutes",
        epoch
    );

    const lastBar =
        Number(data[data.length - 1].n) < 5
            ? data.pop()!
            : data[data.length - 1];

    return { data, lastBar };
}
