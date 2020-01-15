const { addDays, startOfDay } = require('date-fns');
const { alpaca } = require("../connection/alpaca.js");

const date = new Date();

const getDayBars = (symbols, days = 100, lookback = 0) => {
    console.log(
        new Date(
            new Date().setDate(date.getDate() - lookback)
        ).toLocaleDateString()
    );

    return getBars("1D", symbols, days, lookback);
};

const getIntradayBars = (symbols, days = 100, lookback = 0, period="15Min") => {
    return getBars(period, symbols, days, lookback);
};

const getBars = (timeframe, symbols, days, lookback) => {
    if (!symbols || !symbols.length || !Array.isArray(symbols)) {
        throw new Error("require an array");
    }

    if (symbols.length > 200) {
        console.log(`warning: truncating to top 200 symbols`);
    }

    return alpaca.getBars(timeframe, symbols.slice(0, 200), {
        start: startOfDay(addDays(date, -days)),
        end: addDays(date, -lookback),
    });
};

module.exports = {
    getDayBars,
    getIntradayBars
};
