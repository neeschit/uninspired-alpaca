import { Bar, TickBar } from "../data/data.model";
import { insertBar, getTodaysData, getYesterdaysEndingBars } from "../resources/stockData";
import { getMinutes, isSameDay } from "date-fns";
import { LOGGER } from "../instrumentation/log";

export const fiveMinuteDataCache: { [symbol: string]: Bar[] } = {};

export const handleAggregateDataPosted = async (bar: TickBar, symbol: string) => {
    try {
        await insertBar(bar, symbol, true);
    } catch (e) {
        LOGGER.error(e);
    }

    const minutes = getMinutes(bar.t);

    const isRefreshMinute = minutes % 5 === 4;

    fiveMinuteDataCache[symbol] = fiveMinuteDataCache[symbol] || [];

    const data = fiveMinuteDataCache[symbol];

    const lastTime = data && data[data.length - 1].t;

    const cacheAge = Math.abs(lastTime + 300000 - bar.t);

    const needsRefresh = isRefreshMinute || cacheAge >= 298000;

    if (needsRefresh) {
        const bars = await getTodaysData(symbol);

        const data = fiveMinuteDataCache[symbol];

        const lastTime = data && data[data.length - 1].t;

        const newBars = bars.filter((b) => b.t > lastTime);

        fiveMinuteDataCache[symbol].push(...newBars);
    }
};

export const cacheBars = async (symbol: string, currentEpoch = Date.now()) => {
    const todayFiveMinutes = await getTodaysData(symbol, currentEpoch);
    const ydayFiveMinutes = await getYesterdaysEndingBars(symbol, currentEpoch);

    const screenerData = [];

    screenerData.push(...ydayFiveMinutes.reverse());
    screenerData.push(...todayFiveMinutes);

    fiveMinuteDataCache[symbol] = screenerData;
};

export const getBarsForSymbol = async (symbol: string, epoch = Date.now()) => {
    try {
        if (!fiveMinuteDataCache[symbol]) {
            await cacheBars(symbol, epoch);
        }

        const bars = fiveMinuteDataCache[symbol];

        return bars.filter((b) => b.t <= epoch);
    } catch (e) {
        LOGGER.error(e);
        return [];
    }
};

export const getLastBarForSymbol = async (symbol: string, epoch = Date.now()) => {
    const bars = await getBarsForSymbol(symbol, epoch);

    return bars.length ? bars[bars.length - 1] : null;
};
