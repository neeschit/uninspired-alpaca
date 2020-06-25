import {
    getApiServer,
    Service,
    getFromService,
    messageService,
    isOwnedByService,
} from "../util/api";
import { Bar, TickBar } from "../data/data.model";
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

const server = getApiServer(Service.data);

server.get("/adx", async () => {});

export const getBarsFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar[]> => {
    try {
        const bars: Bar[] = (await getFromService(Service.data, "/bars/" + symbol, {
            epoch: currentEpoch,
        })) as any;

        return bars;
    } catch (e) {
        LOGGER.error(e);
    }

    return [];
};

server.get("/bars/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    try {
        return getBarsForSymbol(symbol, epoch);
    } catch (e) {
        return [];
    }
});

export const getBarFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar | null> => {
    try {
        const bar: Bar = (await getFromService(Service.data, "/bar/" + symbol, {
            epoch: currentEpoch,
        })) as any;

        return bar;
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};

server.get("/bar/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastBarForSymbol(symbol, epoch);
});
export const getLastMinuteBarFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar | null> => {
    try {
        const bar: Bar = (await getFromService(Service.data, "/minute_bar/" + symbol, {
            epoch: currentEpoch,
        })) as any;

        return bar;
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};

server.get("/minute_bar/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastMinuteBarForSymbol(symbol, epoch);
});

export const postAggregatedMinuteUpdate = async (
    symbol: string,
    bar: TickBar
): Promise<unknown> => {
    try {
        return messageService(Service.data, `/bar/${symbol}`, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};

server.post("/bar/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    const bar: TickBar = request.body;

    await handleAggregateDataPosted(bar, symbol);

    return {
        success: true,
    };
});

if (isOwnedByService(Service.data) && !isBacktestingEnv()) {
    Promise.all(currentTradingSymbols.map((symbol) => cacheBars(symbol))).catch(LOGGER.error);
    Promise.all(currentTradingSymbols.map((symbol) => cacheMinuteBars(symbol))).catch(LOGGER.error);
}
