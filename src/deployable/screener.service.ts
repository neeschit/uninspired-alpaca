import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service, notifyService } from "../util/api";
import { getMegaCaps } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getData, getSimpleData, getTodaysData } from "../resources/stockData";
import { set, addBusinessDays, getMinutes } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { TradePlan } from "../data/data.model";
import { postHttps } from "../util/post";

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

const megacaps = getMegaCaps();

const strategies: NarrowRangeBarStrategy[] = [];

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

    const currentEpoch = 1588101839000;
    Date.now();

    const screenerData = await getTodaysData(symbol, currentEpoch);

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch);
};

const screenSymbols = (symbols: string[]) => {
    return symbols.map(screenSymbol);
};
