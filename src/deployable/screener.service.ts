import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service, notifyService } from "../util/api";
import { getMegaCaps } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import {
    getData,
    getSimpleData,
    getTodaysData,
    getYesterdaysEndingBars,
} from "../resources/stockData";
import { set, addBusinessDays, getMinutes } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { TradePlan } from "../data/data.model";
import { postHttps } from "../util/post";
import { AlpacaPosition, AlpacaOrder } from "@neeschit/alpaca-trade-api";

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

const megacaps = getMegaCaps();

const strategies: NarrowRangeBarStrategy[] = [];

let positions: AlpacaPosition[] = [];
let openOrders: AlpacaOrder[] = [];

setInterval(async () => {
    positions = await alpaca.getPositions();
    openOrders = await alpaca.getOrders({ status: "open" });
}, 2000);

Promise.all(
    megacaps.map(async (symbol) => {
        const dailyBars = await getSimpleData(symbol, addBusinessDays(Date.now(), -18).getTime());
        strategies.push(
            new NarrowRangeBarStrategy({
                symbol,
                bars: dailyBars,
            })
        );
    })
);

server.post("/aggregates", async (request, reply) => {
    const symbols = Object.keys(request.body);
    const promises = screenSymbols(symbols);

    const trades = [];

    for (const tradePromise of promises) {
        try {
            const trade = await tradePromise;

            if (trade) {
                trades.push(trade);
            }
        } catch (e) {
            server.log.error(e);
        }
    }

    if (trades.length) {
        await notifyService(Service.management, "/trades", trades);
    }

    return {
        success: true,
    };
});

server.get("/healthcheck", async (request, reply) => {
    return "all is well";
});

server.listen(Service.screener, (err) => {
    const serverAddress = server.server && server.server.address();
    if (err || !serverAddress || typeof serverAddress === "string") {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`server listening on ${serverAddress.port}`);
});

const screenSymbol = async (symbol: string) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const currentEpoch = Date.now();

    const today = await getTodaysData(symbol, currentEpoch);
    const yday = await getYesterdaysEndingBars(symbol, currentEpoch);

    const screenerData = [];

    screenerData.push(...yday.reverse());
    screenerData.push(...today);

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch, positions);
};

const screenSymbols = (symbols: string[]) => {
    return symbols.map(screenSymbol);
};
