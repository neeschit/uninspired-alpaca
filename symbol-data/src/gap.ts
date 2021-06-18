import {
    getMarketCloseTimeForDay,
    getMarketOpenTimeForDay,
} from "@neeschit/core-data";
import { addBusinessDays, endOfDay, formatISO } from "date-fns";
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
    const marketCloseTimeToday = getMarketCloseTimeForDay(epoch, calendar);

    const generator = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(addBusinessDays(epoch, -4)),
            end: formatISO(epoch),
            timeframe: "1Day",
            limit: 10,
        },
        alpacaClient.configuration
    );

    const bars = [];

    for await (let b of generator) {
        bars.push(b);
    }

    const ydayDailyBar =
        Date.now() > marketCloseTimeToday
            ? bars[bars.length - 2]
            : bars[bars.length - 1];

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
