import { AlpacaTradesV2, Calendar } from "@neeschit/alpaca-trade-api";
import { formatISO } from "date-fns";
import { getMarketOpenTimeForDay } from "@neeschit/core-data";
import { AlpacaClientSingleton } from "./client";
import { DataRequest } from "./interfaces";

const alpacaClient = AlpacaClientSingleton.getClient();

export const getReducedBarFromTrades = async ({
    symbol,
    epoch,
    calendar,
}: DataRequest) => {
    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);
    const lastMinuteTrades = alpacaClient.getTradesV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay + 239900),
            end: formatISO(epoch),
            limit: 0,
        },
        alpacaClient.configuration
    );

    const trades: AlpacaTradesV2[] = [];

    for await (const trade of lastMinuteTrades) {
        trades.push(trade);
    }

    return reduceTradesToBar(trades);
};

export const reduceTradesToBar = (trades: AlpacaTradesV2[]) => {
    return trades.reduce(
        ({ h, l, v, c, o, t }, trade) => {
            const newHigh = trade.p > h ? trade.p : h;
            const newLow = trade.p < l ? trade.p : l;
            return {
                h: newHigh,
                l: newLow,
                v: v + trade.s,
                c,
                o,
                t,
            };
        },
        {
            h: Number.MIN_SAFE_INTEGER,
            l: Number.MAX_SAFE_INTEGER,
            v: 0,
            c: trades[trades.length - 1].p,
            o: trades[0].p,
            t: trades[0].t,
        }
    );
};
