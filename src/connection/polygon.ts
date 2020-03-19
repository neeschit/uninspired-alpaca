import * as dotenv from "dotenv";
import { format } from "date-fns";
import { get } from "../util/get";
import { PeriodType, DefaultDuration, Bar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import WebSocket from "ws";
import { EventEmitter } from "events";

const config = dotenv.config().parsed;

const API_KEY = (config && config.ALPACA_SECRET_KEY_ID) || process.env.ALPACA_SECRET_KEY_ID;

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

const wssUrl = "wss://alpaca.socket.polygon.io/stocks";

const getWebsocketServer = () => {
    const wssServer = new WebSocket(wssUrl);

    wssServer.once("open", () => {
        wssServer.send(
            JSON.stringify({
                action: "auth",
                params: API_KEY
            })
        );
    });

    return wssServer;
};

class SocketManager {
    private serverInstance?: WebSocket;
    private emitter: EventEmitter = new EventEmitter();
    private isConnected: boolean = false;
    private symbolsSubscribedTo = [];

    get server() {
        if (this.serverInstance) {
            return this.serverInstance;
        }

        this.serverInstance = getWebsocketServer();

        this.serverInstance.on("message", (message: WebSocket.Data) => {
            const messageJSON = JSON.parse(message.toString() || "[{}]")[0];

            if (messageJSON.ev === "status") {
                this.processStatusMessage(messageJSON);
            } else if (messageJSON.ev === "A") {
                this.processAggregatedSecond(messageJSON);
            } else if (messageJSON.ev === "AM") {
                this.processAggregatedSecond(messageJSON);
            } else {
                LOGGER.info(messageJSON);
                this.emitter.emit("message", messageJSON);
            }
        });
        this.serverInstance.on("close", () => {
            this.emitter.emit("close");
        });
        return this.emitter;
    }

    processStatusMessage({ ev, status, message }: { ev: string; status: string; message: string }) {
        if (status === "auth_success" && !this.isConnected) {
            this.emitter.emit("auth");
            this.isConnected = true;
        }
        if (status === "success") {
            // subscribed to: A.PSX
            if (message.indexOf("subscribed to") === -1) {
                LOGGER.info(message);
            }
        } else {
            LOGGER.info(arguments);
        }
    }

    processAggregatedSecond(params: PolygonTradeUpdate) {
        this.emitter.emit("tick_update", params);
    }

    processAggregatedMinute(params: PolygonTradeUpdate) {
        this.emitter.emit("minute_update", params);
    }

    subscribeToTickLevelUpdates(symbols: string[], updateType: "A" | "AM" | "T" | "Q" = "A") {
        for (const symbol of symbols) {
            this.serverInstance?.send(
                JSON.stringify({
                    action: "subscribe",
                    params: `${updateType}.${symbol}`
                })
            );
        }
    }

    close() {
        if (!this.serverInstance) {
            return;
        }

        this.serverInstance.close();
    }
}

let polygonSocketManager: SocketManager;

export const getSocketManager = () => {
    if (!polygonSocketManager) {
        polygonSocketManager = new SocketManager();
    }

    return polygonSocketManager;
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
