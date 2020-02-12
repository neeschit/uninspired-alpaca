import { addDays, startOfDay } from "date-fns";
import { getPolyonData, PeriodType } from "../connection/polygon";
import { Bar } from "../connection/bar";

const date = new Date();

export const getDayBars = (symbols: string[], days = 100, lookback = 0) => {
    console.log(
        new Date(
            new Date().setDate(date.getDate() - lookback)
        ).toLocaleDateString()
    );

    return getBars(PeriodType.day, symbols, days, lookback);
};

export const getIntradayBars = (
    symbols: string[],
    days = 100,
    lookback = 0,
    period = "15Min"
) => {
    return getBars(period, symbols, days, lookback);
};

const getBars = (
    timeframe: string,
    symbols: string[],
    days: number,
    lookback: number
): Promise<{
    [index: string]: Bar[];
}[]> => {
    if (!symbols || !symbols.length || !Array.isArray(symbols)) {
        throw new Error("require an array");
    }
    const start = startOfDay(addDays(date, -days));
    const end = addDays(date, -lookback + 1);
    const promises = symbols.map(symbol =>
        getPolyonData(symbol, start, end, timeframe)
    );

    return Promise.all(promises);
};
