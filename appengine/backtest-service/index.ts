import fastify from "fastify";
import {
    getLargeCaps,
    getMarketOpenTimeForDay,
    getWatchlistCacheKey,
    getCachedBoomStats,
} from "@neeschit/core-data";
import Alpaca from "@neeschit/alpaca-trade-api";
import { getRedisApi } from "@neeschit/redis";
import { BoomBarReply } from "@neeschit/common-interfaces";
import {
    handleBoomBarReply,
    handleBoombarRequest,
} from "@neeschit/boom-strategy";
import { requestScreen } from "./requestBacktestScreen";

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    bodyLimit: 1048576 * 100,
});

const symbols = getLargeCaps();

const alpaca = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

const redisApi = getRedisApi();

server.get("/screen-boom-request/:date", async (request: { params: any }) => {
    const dateString = request.params.date;
    const date = new Date(dateString);
    const calendar = await alpaca.getCalendar({
        start: date,
        end: date,
    });

    const marketStartTime = getMarketOpenTimeForDay(date.getTime(), calendar);

    const promises = symbols.map((symbol) => {
        return requestScreen(symbol, marketStartTime + 285000, calendar);
    });

    await Promise.all(promises);

    await handleBoombarRequest(redisApi, promises.length, date);

    return true;
});

server.get("/boom-screened/:date", async (request: { params: any }) => {
    const dateString = request.params.date;
    const date = new Date(dateString);

    try {
        const list = await redisApi.promiseSmembers(
            getWatchlistCacheKey(date.getTime())
        );

        if (!list) {
            return [];
        }

        const inflatedListPromises = list.map(async (symbol) => {
            const cachedStats = await redisApi.promiseGet(
                getCachedBoomStats(date.getTime(), symbol)
            );

            if (!cachedStats) {
                return {
                    symbol,
                };
            }

            return {
                symbol,
                ...JSON.parse(cachedStats),
            };
        });

        const inflatedList = Promise.all(inflatedListPromises);

        return inflatedList;
    } catch (e) {
        return [];
    }
});

server.post("/boom-screener-reply", async (request) => {
    const event: any = request.body;

    const decodedData: BoomBarReply = JSON.parse(
        Buffer.from(event.message.data, "base64").toString()
    );

    await handleBoomBarReply(decodedData, redisApi);

    return true;
});

if (process.env.PRODUCTION) {
    server.listen(process.env.PORT || 8080, "0.0.0.0", (err) => {
        const serverAddress = server.server && server.server.address();
        if (err || !serverAddress || typeof serverAddress === "string") {
            server.log.error("uncaught error trying to init server", err);
            process.exit(1);
        }
    });
} else {
    server.listen(process.env.PORT || 8080, (err) => {
        const serverAddress = server.server && server.server.address();
        if (err || !serverAddress || typeof serverAddress === "string") {
            server.log.error("uncaught error trying to init server", err);
            process.exit(1);
        }
    });
}
