import { getApiServer, Service } from "../util/api";
import { TickBar } from "../data/data.model";
import {
    handleAggregateDataPosted,
    getBarsForSymbol,
    getLastBarForSymbol,
    cacheBars,
    getLastMinuteBarForSymbol,
    cacheMinuteBars,
} from "./data.handlers";
import { currentTradingSymbols } from "../data/filters";
import { LOGGER } from "../instrumentation/log";
import { isBacktestingEnv } from "../util/env";
import {
    getBarsFromDataServicePath,
    barFromDataServicePath,
    minuteBarPath,
} from "./data.interfaces";

const server = getApiServer(Service.data);

server.get("/adx", async () => {});

server.get(getBarsFromDataServicePath, async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    try {
        return getBarsForSymbol(symbol, epoch);
    } catch (e) {
        return [];
    }
});

server.get(barFromDataServicePath, async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastBarForSymbol(symbol, epoch);
});

server.get(minuteBarPath, async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastMinuteBarForSymbol(symbol, epoch);
});

server.post(barFromDataServicePath, async (request) => {
    const symbol = request.params && request.params.symbol;

    const bar: TickBar = request.body;

    await handleAggregateDataPosted(bar, symbol);

    return {
        success: true,
    };
});

if (!isBacktestingEnv()) {
    Promise.all(currentTradingSymbols.map((symbol) => cacheBars(symbol))).catch(LOGGER.error);
    Promise.all(currentTradingSymbols.map((symbol) => cacheMinuteBars(symbol))).catch(LOGGER.error);
}
