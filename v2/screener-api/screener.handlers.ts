import { addBusinessDays, parse } from "date-fns";
import { getSimpleData } from "../../src/resources/stockData";
import { NarrowRangeBarStrategy } from "../../src/strategy/narrowRangeBar";

export const getWatchlistForDate = async (
    date: string,
    symbolUniverse: string[]
) => {
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
        strategy.screenForNarrowRangeBars();
        if (strategy.nrbs.length) {
            return symbol;
        }
    });

    const data = await Promise.all(filteredSymbols);

    return data.filter((data) => data);
};
