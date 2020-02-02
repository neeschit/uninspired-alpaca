const { addDays, startOfDay } = require("date-fns");
const { alpaca } = require("../connection/alpaca.js");
const { getPolyonData, PeriodType } = require("../connection/polygon");

const date = new Date();

const getDayBars = (symbols, days = 100, lookback = 0) => {
    console.log(
        new Date(
            new Date().setDate(date.getDate() - lookback)
        ).toLocaleDateString()
    );

    return getBars(PeriodType.day, symbols, days, lookback);
};

const getIntradayBars = (
    symbols,
    days = 100,
    lookback = 0,
    period = "15Min"
) => {
    return getBars(period, symbols, days, lookback);
};

const getBars = (timeframe, symbols, days, lookback) => {
    if (!symbols || !symbols.length || !Array.isArray(symbols)) {
        throw new Error("require an array");
    }
    const start = startOfDay(addDays(date, -days));
    const end = addDays(date, -lookback);
    const promises = symbols.map(symbol => getPolyonData(symbol, start, end));

    return Promise.all(promises);
};

module.exports = {
    getDayBars,
    getIntradayBars
};
