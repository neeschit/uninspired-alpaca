const { alpaca } = require("../connection/alpaca.js");

const date = new Date();

const getDayBars = (symbols, days = 100, lookback = 0) => {
  if (!symbols || !symbols.length || !Array.isArray(symbols)) {
    throw new Error("require an array");
  }

  if (symbols.length > 200) {
    console.log(`warning: truncating to top 200 symbols`);
  }

  console.log(
    new Date(new Date().setDate(date.getDate() - lookback)).toLocaleDateString()
  );

  return alpaca.getBars("1D", symbols.slice(0, 200), {
    start: new Date(new Date().setDate(date.getDate() - days)),
    end: new Date(new Date().setDate(date.getDate() - lookback))
  });
};

module.exports = {
  getDayBars
};
