import { addBusinessDays, parse } from "date-fns";
import { getSimpleData } from "../../src/resources/stockData";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";

const cache: Record<string, string[]> = {};

function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
}

export const getWatchlistForDate = async (
    symbolUniverse: string[],
    date: string
) => {
    if (cache[date]) {
        return cache[date];
    }

    const formattedDate = parse(date, "MM-dd-yyyy", new Date());

    const filteredSymbols = symbolUniverse.map(async (symbol) => {
        const data = await getSimpleData(
            symbol,
            addBusinessDays(formattedDate, -18).getTime(),
            false,
            formattedDate.getTime()
        );

        const strategy = new NarrowRangeBarStrategy({
            symbol,
            bars: data,
        });
        if (strategy.screenForNarrowRangeBars()) {
            return symbol;
        }
    });

    const data = await Promise.all(filteredSymbols);

    const watchlist: string[] = data.filter(notUndefined);

    if (watchlist && watchlist.length) {
        cache[date] = watchlist;
    }

    return watchlist;
};
