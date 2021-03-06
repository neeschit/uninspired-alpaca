import { addBusinessDays, parse } from "date-fns";
import { getAverageTrueRange } from "../../libs/core-indicators/indicator/trueRange";
import { getPolyonData } from "../../libs/core-utils/resources/polygon";
import { NarrowRangeBarStrategy } from "../../libs/strategy/narrowRangeBar";
import { DailyWatchlist } from "./screener.interfaces";

const cache: Record<string, DailyWatchlist[]> = {};

function notUndefined<T extends DailyWatchlist>(x: T | undefined): x is T {
    return x?.symbol !== undefined;
}

export const getWatchlistForDate = async (
    symbolUniverse: string[],
    date: string
) => {
    if (cache[date]) {
        return cache[date];
    }

    const formattedDate = parse(date, "yyyy-MM-dd", new Date());

    const filteredSymbols = symbolUniverse.map(async (symbol) => {
        const result = await getPolyonData(
            symbol,
            addBusinessDays(formattedDate, -18),
            addBusinessDays(formattedDate, -1)
        );

        const data = result[symbol];

        const { tr, atr } = getAverageTrueRange(data, false);

        const strategy = new NarrowRangeBarStrategy({
            symbol,
            bars: data,
            tr,
        });
        if (strategy.screenForNarrowRangeBars()) {
            return {
                symbol,
                atr: atr.pop()!.value,
            };
        }
    });

    const data = await Promise.all(filteredSymbols);

    const watchlist: DailyWatchlist[] = data.filter(notUndefined);

    if (watchlist && watchlist.length) {
        cache[date] = watchlist;
    }

    return watchlist;
};
