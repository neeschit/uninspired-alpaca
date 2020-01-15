const { parse } = require("date-fns");

const { get } = require('./get.js');

const getDayForAlpacaTimestamp = t => parse(t, "t", new Date(t));

module.exports = {
    getDayForAlpacaTimestamp,
    get
};