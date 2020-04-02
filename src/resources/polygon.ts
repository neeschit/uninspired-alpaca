import * as dotenv from "dotenv";
import { format } from "date-fns";
import { get } from "../util/get";
import { PeriodType, DefaultDuration, Bar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import WebSocket from "ws";
import { EventEmitter } from "events";

const config = dotenv.config().parsed;

const API_KEY =
    (config && config.LIVE_SECRET_KEY_ID) ||
    (config && config.ALPACA_SECRET_KEY_ID) ||
    process.env.ALPACA_SECRET_KEY_ID;

const getPolygonApiUrl = (resourceUrl: string, version = "v1") =>
    `https://api.polygon.io/${version}/${resourceUrl}?apiKey=${API_KEY}`;

export const getTickerDetails = (symbol: string) => {
    const resourceUrl = `meta/symbols/${symbol.toUpperCase()}/company`;
    const url = getPolygonApiUrl(resourceUrl);

    return get(url);
};

const dateFormat = "yyyy-MM-dd";

export const getPolyonData = (
    symbol: string,
    start: Date,
    end: Date,
    period: PeriodType = PeriodType.day,
    duration: DefaultDuration = DefaultDuration.one
): Promise<{ [index: string]: Bar[] }> => {
    const modifiedStart = format(start, dateFormat);
    const modifiedEnd = format(end, dateFormat);
    const resource = `aggs/ticker/${symbol}/range/${duration}/${period}/${modifiedStart}/${modifiedEnd}`;

    const url = getPolygonApiUrl(resource, "v2");

    return get(url).then((response: any) => {
        if (!response.results) {
            LOGGER.debug(url);
        }
        return {
            [symbol]: response.results
        };
    });
};

export const getSimplePolygonData = (
    symbol: string,
    start: Date,
    end: Date,
    period: PeriodType = PeriodType.day,
    duration: DefaultDuration = DefaultDuration.one
): Promise<Bar[]> => {
    const modifiedStart = format(start, dateFormat);
    const modifiedEnd = format(end, dateFormat);
    const resource = `aggs/ticker/${symbol}/range/${duration}/${period}/${modifiedStart}/${modifiedEnd}`;

    const url = getPolygonApiUrl(resource, "v2");

    return get(url).then((response: any) => {
        if (!response.results) {
            LOGGER.warn(url);
        }
        return response.results;
    });
};

export const getSymbolDataGenerator = (
    symbols: string[],
    duration: DefaultDuration = DefaultDuration.one,
    period: PeriodType = PeriodType.day,
    startDate: Date,
    endDate: Date
) => {
    return async function*() {
        for (const symbol of symbols) {
            const bars = await getSimplePolygonData(symbol, startDate, endDate, period, duration);

            yield {
                bars,
                symbol
            };
        }
    };
};

export const getSymbolDataPromises = async (
    symbols: string[],
    duration: DefaultDuration = DefaultDuration.one,
    period: PeriodType = PeriodType.day,
    startDate: Date,
    endDate: Date
) => {
    const allBars: { bars: Promise<Bar[]>; symbol: string }[] = [];
    for (const symbol of symbols) {
        const bars = getSimplePolygonData(symbol, startDate, endDate, period, duration);

        allBars.push({
            bars,
            symbol
        });
    }

    const screenerBarsPromises = allBars.map(r => r.bars);

    const screenerBars = await Promise.all(screenerBarsPromises);

    return screenerBars.map((b, index) => ({
        bars: b,
        symbol: allBars[index].symbol
    }));
};

export const subscribeToTickLevelUpdates = (
    symbols: string[],
    updateType: "A" | "AM" | "T" | "Q" = "A"
) => {
    return symbols.map(s => `${updateType}.${s}`);
};

export interface PolygonTradeUpdate {
    ev: string;
    sym: string;
    v: number;
    av: number;
    op: number;
    vw: number;
    o: number;
    c: number;
    l: number;
    h: number;
    a: number;
    s: number;
    e: number;
}
