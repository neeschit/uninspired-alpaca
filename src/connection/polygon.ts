import * as dotenv from "dotenv";
import { format } from "date-fns";
import { get } from "../util/get";
import { Bar } from "./bar";

const config = dotenv.config().parsed;

const API_KEY = config && config.ALPACA_SECRET_KEY_ID;

const getPolygonApiUrl = (resourceUrl: string, version = "v1") =>
    `https://api.polygon.io/${version}/${resourceUrl}?apiKey=${API_KEY}`;

export const getTickerDetails = (symbol: string) => {
    const resourceUrl = `meta/symbols/${symbol.toUpperCase()}/company`;
    const url = getPolygonApiUrl(resourceUrl);

    return get(url);
};
export const PeriodType = {
    day: "day",
    hour: "hour",
    minute: "minute"
};

const dateFormat = "yyyy-MM-dd";

export const getPolyonData = (
    symbol: string,
    start: Date,
    end: Date,
    period = PeriodType.day,
    duration = 1
): Promise<{ [index: string]: Bar[] }> => {
    const modifiedStart = format(start, dateFormat);
    const modifiedEnd = format(end, dateFormat);
    const resource = `aggs/ticker/${symbol}/range/${duration}/${period}/${modifiedStart}/${modifiedEnd}`;

    const url = getPolygonApiUrl(resource, "v2");

    return get(url).then((response: any) => {
        return {
            [symbol]: response.results
        };
    });
};
