const dotenv = require("dotenv");
const { format } = require("date-fns");
const { get } = require("../util/get.js");

const config = dotenv.config().parsed;

const API_KEY = config.ALPACA_SECRET_KEY_ID;

const getPolygonApiUrl = (resourceUrl, version = "v1") =>
    `https://api.polygon.io/${version}/${resourceUrl}?apiKey=${API_KEY}`;

const getTickerDetails = symbol => {
    const resourceUrl = `meta/symbols/${symbol.toUpperCase()}/company`;
    const url = getPolygonApiUrl(resourceUrl);

    return get(url);
};
const PeriodType = {
    day: "day",
    hour: "hour",
    minute: "minute"
};

const dateFormat = "yyyy-MM-dd";

const getPolyonData = (
    symbol,
    start,
    end,
    period = PeriodType.day,
    duration = 1
) => {
    start = format(start, dateFormat);
    end = format(end, dateFormat);
    const resource = `aggs/ticker/${symbol}/range/${duration}/${period}/${start}/${end}`;

    const url = getPolygonApiUrl(resource, "v2");

    return get(url, resource)
        .then(response => {
            return {
                [symbol]: response.results
            };
        })
        .catch(console.error);
};

module.exports = {
    getTickerDetails,
    getPolyonData,
    PeriodType
};
