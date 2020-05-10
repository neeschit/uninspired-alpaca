import { getApiServer, Service, getFromService, messageService } from "../util/api";
import { getTodaysData, getYesterdaysEndingBars, insertBar } from "../resources/stockData";
import { Bar, TickBar } from "../data/data.model";
import { getMinutes } from "date-fns";
import { handleAggregateDataPosted, getBarsForSymbol, getLastBarForSymbol } from "./data.handlers";

const server = getApiServer(Service.data);

server.get("/adx", async (request, reply) => {});

export const getBarsFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar[]> => {
    const bars: Bar[] = (await getFromService(Service.data, "/bars/" + symbol, {
        epoch: currentEpoch,
    })) as any;

    return bars;
};

server.get("/bars/:symbol", async (request, reply) => {
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
): Promise<Bar> => {
    const bar: Bar = (await getFromService(Service.data, "/bar/" + symbol, {
        epoch: currentEpoch,
    })) as any;

    return bar;
};

server.get("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastBarForSymbol(symbol, epoch);
});

export const postAggregatedMinuteUpdate = (symbol: string, bar: TickBar): Promise<unknown> => {
    return messageService(Service.data, `/bar/${symbol}`, bar);
};

server.post("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;

    const bar: TickBar = request.body;

    await handleAggregateDataPosted(bar, symbol);

    return {
        success: true,
    };
});
