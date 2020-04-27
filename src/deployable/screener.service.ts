import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service, notifyService } from "../util/api";
import { getMegaCaps } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getData, getSimpleData } from "../resources/stockData";
import { set, addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { TradePlan } from "../data/data.model";
import { postHttps } from "../util/post";
import { processOrderFromStrategy } from "../services/tradeManagement";

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

const megacaps = getMegaCaps();

const strategies: NarrowRangeBarStrategy[] = [];

megacaps.map(async (symbol) => {
    const dailyBars = await getSimpleData(symbol, addBusinessDays(Date.now(), -18).getTime());
    strategies.push(
        new NarrowRangeBarStrategy({
            symbol,
            bars: dailyBars,
        })
    );
});

server.post("/aggregates", async (request, reply) => {
    const promises = screenSymbols(megacaps);

    const trades = [];

    for (const tradePromise of promises) {
        try {
            const trade = await tradePromise;

            if (trade) {
                await postEntry(trade.plan.symbol, trade.config.t, trade.plan);
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

    const screenerData = await getData(
        symbol,
        addBusinessDays(currentEpoch, -1).getTime(),
        "5 minutes"
    );

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(
        screenerData.filter((b) => b.t < currentEpoch),
        currentEpoch
    );
};

const screenSymbols = (symbols: string[]) => {
    return symbols.map(screenSymbol);
};

const slackHookOptions = {
    hostname: "hooks.slack.com",
    path: "/services/T4EKRGB54/B0138S9A3LY/VuZ8iHEDOw9mjzHKPI1HQLwD",
};

const postEntry = async (symbol: string, timestamp: number, plan: TradePlan) => {
    const text = `Looking like a good entry for ${symbol} at ${new Date(
        timestamp
    ).toISOString()} with plan = ${JSON.stringify(plan)}`;

    return postHttps({
        ...slackHookOptions,
        data: {
            text,
        },
    });
};
