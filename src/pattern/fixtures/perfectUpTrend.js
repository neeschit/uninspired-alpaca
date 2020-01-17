const uptrend = require("./uptrend.js");
const getTrend = require("./getTrend.js");
const { TrendType } = require("../trend/trendIdentifier.js");

const getPerfectUptrend = (start = 100, percentageIncrease = 10, step = 0) => {
    return getTrend(uptrend, TrendType.up, start, percentageIncrease, step);
};

module.exports = getPerfectUptrend;
