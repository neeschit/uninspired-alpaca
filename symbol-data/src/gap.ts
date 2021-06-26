import {
    getMarketCloseTimeForDay,
    getMarketOpenTimeForDay,
} from "@neeschit/core-data";
import {
    addBusinessDays,
    endOfDay,
    formatISO,
    parseISO,
    startOfDay,
} from "date-fns";
import { SimpleBar } from "@neeschit/common-interfaces";
import { AlpacaClientSingleton } from "./client";
import { GapDataRequest } from "./interfaces";

const alpacaClient = AlpacaClientSingleton.getClient();

export const getGapPercentage = async ({
    symbol,
    calendar,
    epoch,
    limit,
}: GapDataRequest) => {
    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);

    const generator = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(addBusinessDays(epoch, -4)),
            end: formatISO(startOfDay(epoch)),
            timeframe: "1Day",
            limit: 10,
        },
        alpacaClient.configuration
    );

    const bars = [];

    const dayStart = startOfDay(epoch);

    for await (let b of generator) {
        if (startOfDay(parseISO(b.t)).getTime() !== dayStart.getTime()) {
            bars.push(b);
        }
    }

    if (!bars.length) {
        throw new Error(
            "unexpected error getting gap for " +
                symbol +
                `on ${new Date(epoch).toISOString()}`
        );
    }

    const ydayDailyBar = bars[bars.length - 1];

    const previousClose = ydayDailyBar.c;

    const firstFiveMinTodayResponse = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay),
            end: formatISO(endOfDay(epoch)),
            limit,
            timeframe: "1Min",
        },
        alpacaClient.configuration
    );

    const minuteBarsForEpoch: SimpleBar[] = [];

    for await (const bar of firstFiveMinTodayResponse) {
        minuteBarsForEpoch.push(bar);
    }

    const openToday = minuteBarsForEpoch[0].o;

    return {
        gap: ((openToday - previousClose) / previousClose) * 100,
        minuteBars: minuteBarsForEpoch,
    };
};
