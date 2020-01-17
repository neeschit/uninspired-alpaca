const dotenv = require("dotenv");
const https = require("https");
const { get } = require("../util/get.js");

const config = dotenv.config().parsed;

const API_KEY = config.ALPACA_SECRET_KEY_ID;

const getPolygonApiUrl = resourceUrl =>
    `https://api.polygon.io/v1/${resourceUrl}?apiKey=${API_KEY}`;

const getTickerDetails = symbol => {
    const resourceUrl = `meta/symbols/${symbol.toUpperCase()}/company`;
    const url = getPolygonApiUrl(resourceUrl);

    return get(url);
};

module.exports = {
    getTickerDetails
};
