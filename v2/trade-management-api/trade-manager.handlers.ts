import { format } from "date-fns";
import { getWatchlistFromScreenerService } from "../screener-api/screener.interfaces";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
} from "../strategy/narrowRangeBar";
import { getData } from "../../src/resources/stockData";
import { getMarketOpenMillis } from "../../src/util/market";
import { getOpenPositions } from "../brokerage-helpers";

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

    const data = await getData(
        symbol,
        getMarketOpenMillis(epoch).getTime(),
        "5 minutes",
        epoch
    );

    const { atr } = getAverageTrueRange(data, false);

    const currentAtr = atr!.pop()!.value;

    const plan = getSafeOrbEntryPlan({
        currentAtr,
        marketBarsSoFar: data,
        symbol,
        lastPrice: data[data.length - 1].c,
        openingBar: data[0],
    });

    return plan;
};
