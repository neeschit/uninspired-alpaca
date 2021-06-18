import { getMarketOpenTimeForDay } from "@neeschit/core-data";
import { formatISO } from "date-fns";
import { AlpacaClientSingleton } from "./client";
import { DataRequest } from "./interfaces";

export const getVwap = async ({ epoch, symbol, calendar }: DataRequest) => {
    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);
    const alpacaClient = AlpacaClientSingleton.getClient();

    const lastMinuteTrades = alpacaClient.getTradesV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay + 1),
            end: formatISO(epoch),
            limit: 0,
        },
        alpacaClient.configuration
    );

    let volumeWeightedSum = 0;
    let totalVolume = 0;

    for await (const trade of lastMinuteTrades) {
        volumeWeightedSum += trade.p * trade.s;
        totalVolume += trade.s;
    }

    return Math.round((volumeWeightedSum / totalVolume) * 100) / 100;
};

export const getVwapFromBars = async ({
    epoch,
    symbol,
    calendar,
}: DataRequest) => {
    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);
    const alpacaClient = AlpacaClientSingleton.getClient();
    const bars = [];

    const barsResponse = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay + 1),
            end: formatISO(epoch),
            limit: 0,
            timeframe: "1Min",
        },
        alpacaClient.configuration
    );

    for await (const bar of barsResponse) {
        bars.push(bar);
    }

    const { sum, volume } = bars.reduce(
        ({ sum, volume }, bar) => {
            const price = (bar.h + bar.l + bar.c) / 3;
            sum += price * bar.v;
            volume += bar.v;

            return {
                sum,
                volume,
            };
        },
        {
            sum: 0,
            volume: 0,
        }
    );

    return Math.round((sum / volume) * 100) / 100;
};
