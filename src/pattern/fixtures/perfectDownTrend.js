const downtrend = require("./downtrend.js");
const getTrend = require("./getTrend.js");
const { TrendType } = require("../trend/trendIdentifier.js");

const getPerfectDownTrend = (
    start = 100,
    percentageIncrease = 10,
    step = 0
) => {
    return getTrend(downtrend, TrendType.down, start, percentageIncrease, step);
};

module.exports = getPerfectDownTrend;
