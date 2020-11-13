import { format } from "date-fns";
import { getWatchlistFromScreenerService } from "../screener-api";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
} from "../strategy/narrowRangeBar";
import { getData, getLastPrice } from "../../src/resources/stockData";
import { getMarketOpenMillis } from "../../src/util/market";
import { getOpenPositions } from "../brokerage-helpers";
import { createOrderSynchronized } from "../trade-management-helpers";

export const lookForEntry = async (symbol: string, epoch = Date.now()) => {
    const watchlist = await getWatchlistFromScreenerService(
        format(new Date(), "MM-dd-yyyy")
    );

    if (watchlist.every((watchedSymbol) => watchedSymbol !== symbol)) {
        return null;
    }

    const positions = await getOpenPositions();

    if (positions.some((p) => p.symbol === symbol)) {
        return null;
    }

    if (!isTimeForOrbEntry(epoch)) {
        return null;
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
    });

    return plan;
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
