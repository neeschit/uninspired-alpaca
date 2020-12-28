import DateFns from "date-fns";
const { addDays, startOfDay } = DateFns;
import { getPolyonData, getSimplePolygonData } from "../resources/polygon.js";
import {
    TimestampType,
    Bar,
    PeriodType,
    DefaultDuration,
} from "../data/data.model.js";
import { LOGGER } from "../instrumentation/log.js";

const date = new Date();

export const getDayBars = (symbols: string[], days = 100, lookback = 100) => {
    LOGGER.debug(
        new Date(
            new Date().setDate(date.getDate() - lookback)
        ).toLocaleDateString()
    );

    return getBars(PeriodType.day, symbols, days, lookback);
};

export const getDayBarsFormatted = (
    symbols: string[],
    days = 100,
    lookback = 100
) => {
    return getDayBars(symbols, days, lookback).then((responses) => {
        const bars: { [index: string]: Bar[] } = {};

        responses.map((response) => {
            Object.assign(bars, response);
        });

        return bars;
    });
};

export const getIntradayBars = (
    symbols: string[],
    days = 100,
    lookback = 0,
    period = PeriodType.minute,
    duration = DefaultDuration.fifteen
) => {
    return getBars(period, symbols, days, lookback, duration);
};

export const getBarsByDate = (
    symbol: string,
    start: Date,
    end: Date,
    duration: DefaultDuration = DefaultDuration.five,
    period: PeriodType = PeriodType.minute
) => {
    return getSimplePolygonData(symbol, start, end, period, duration);
};

const getBars = (
    period: PeriodType,
    symbols: string[],
    days: number,
    lookback: number,
    duration: DefaultDuration = DefaultDuration.one
): Promise<
    {
        [index: string]: Bar[];
    }[]
> => {
    if (!symbols || !symbols.length || !Array.isArray(symbols)) {
        throw new Error("require an array");
    }
    const start = startOfDay(addDays(date, -(days + lookback)));
    const end = addDays(date, -lookback + 1);
    const promises = symbols.map((symbol) =>
        getPolyonData(symbol, start, end, period, duration)
    );

    return Promise.all(promises);
};
