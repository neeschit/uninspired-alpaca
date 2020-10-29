import Alpaca from "@neeschit/alpaca-trade-api";
import { format } from "date-fns";
import { getWatchlistFromScreenerService } from "../screener-api/screener.interfaces";
import { isTimeForOrbEntry } from "../../src/strategy/narrowRangeBar";

export const positionCache: Alpaca.AlpacaPosition[] = [];

export const lookForEntry = async (symbol: string, epoch = Date.now()) => {
    const watchlist = await getWatchlistFromScreenerService(
        format(new Date(), "MM-dd-yyyy")
    );

    if (watchlist.every((watchedSymbol) => watchedSymbol !== symbol)) {
        return null;
    }

    if (!isTimeForOrbEntry(epoch)) {
        return null;
    }

    return true;
};
