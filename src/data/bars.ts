import { addDays, startOfDay } from "date-fns";
import { getPolyonData, getSimplePolygonData } from "../connection/polygon";
import { TimestampType, Bar, PeriodType, DefaultDuration } from "../data/data.model";

const date = new Date();

export const getDayBars = (symbols: string[], days = 100, lookback = 100) => {
    console.log(new Date(new Date().setDate(date.getDate() - lookback)).toLocaleDateString());

    return getBars(PeriodType.day, symbols, days, lookback);
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
): Promise<{
    [index: string]: Bar[];
}[]> => {
    if (!symbols || !symbols.length || !Array.isArray(symbols)) {
        throw new Error("require an array");
    }
    const start = startOfDay(addDays(date, -(days + lookback)));
    const end = addDays(date, -lookback + 1);
    const promises = symbols.map(symbol => getPolyonData(symbol, start, end, period, duration));

    return Promise.all(promises);
};
