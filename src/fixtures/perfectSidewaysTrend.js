const downtrend = require("./downtrend.js");
const getTrend = require("./getTrend.js");
const { TrendType } = require("../pattern/trend/trendIdentifier.js");

module.exports = getTrend(downtrend, TrendType.sideways);
