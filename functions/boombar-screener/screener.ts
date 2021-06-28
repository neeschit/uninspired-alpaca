import { Calendar } from "@neeschit/alpaca-trade-api";
import {
    getGapPercentage,
    getReducedBarFromTrades,
    reduceToSingleBar,
} from "@neeschit/symbol-data";
import { isBoom } from "@neeschit/boom-strategy";

export const isBoomBar = async ({
    symbol,
    epoch,
    calendar,
}: {
    symbol: string;
    epoch: number;
    calendar: Calendar[];
}) => {
    const { minuteBars, gap } = await getGapPercentage({
        symbol,
        epoch,
        calendar,
        limit: 4,
    });
    const firstFiveBarsToday = minuteBars.slice(0, 4);

    const reducedBar = await getReducedBarFromTrades({
        symbol,
        epoch,
        calendar,
    });

    firstFiveBarsToday[4] = reducedBar;

    const boomBar = reduceToSingleBar(firstFiveBarsToday);

    const response = await isBoom({
        symbol,
        boomBar,
        gap,
    });

    if (!response) {
        return null;
    }

    return {
        ...response,
        boomBar,
    };
};
