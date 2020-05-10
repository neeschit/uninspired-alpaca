import { Bar, TickBar } from "../data/data.model";
import { insertBar, getTodaysData, getYesterdaysEndingBars } from "../resources/stockData";
import { getMinutes } from "date-fns";
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

    const lastEpoch = data && data[data.length - 1].t;

    if (isRefreshMinute) {
        const bars = await getTodaysData(symbol, bar.t + 1000);

        fiveMinuteDataCache[symbol].push(...bars);
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
