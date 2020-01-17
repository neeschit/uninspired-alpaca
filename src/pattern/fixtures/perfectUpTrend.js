const uptrend = require("./uptrend.js");
const getTrend = require("./getTrend.js");
const { TrendType } = require("../trend/trendIdentifier.js");

module.exports = getTrend(uptrend);
