import { getApiServer, Service } from "../util/api";
import { getTodaysData, getYesterdaysEndingBars, insertBar } from "../resources/stockData";
import { Bar, TickBar } from "../data/data.model";
import { getMinutes } from "date-fns";
import { handleAggregateDataPosted, getBarsForSymbol, getLastBarForSymbol } from "./data.handlers";

const server = getApiServer(Service.data);

server.get("/adx", async (request, reply) => {});

server.get("/bars/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getBarsForSymbol(symbol, epoch);
});

server.get("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    return getLastBarForSymbol(symbol, epoch);
});

server.post("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;

    const bar: TickBar = request.body;

    await handleAggregateDataPosted(bar, symbol);

    return {
        success: true,
    };
});
