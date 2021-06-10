import fastify from "fastify";
import {
    getLargeCaps,
    getMarketOpenTimeForDay,
    getCacheKey,
} from "@neeschit/core-data";
import Alpaca from "@neeschit/alpaca-trade-api";
import { getRedisApi } from "@neeschit/redis";
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

export const getWatchlistCacheKey = (epoch: number) => {
    return getCacheKey("boom_watchlist", epoch);
};

server.get("/screen-boom-request/:date", async (request: { params: any }) => {
    const dateString = request.params.date;
    const date = new Date(dateString);
    const calendar = await alpaca.getCalendar({
        start: date,
        end: date,
    });

    const marketStartTime = getMarketOpenTimeForDay(date.getTime(), calendar);

    console.log(marketStartTime);

    const promises = symbols.map((symbol) => {
        return requestScreen(symbol, marketStartTime + 300000, calendar);
    });

    try {
        await redisApi.promiseSet(
            getCacheKey("boom_requested_count", date.getTime()),
            promises.length.toString()
        );

        await Promise.all(promises);
    } catch (e) {
        console.error(e);
    }

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

        return list;
    } catch (e) {
        return [];
    }
});

server.post("/boom-screener-reply", async (request) => {
    const event: any = request.body;

    const decodedData = JSON.parse(
        Buffer.from(event.message.data, "base64").toString()
    );

    const { symbol, epoch } = decodedData.data;

    console.log(decodedData.data);

    try {
        const key = getWatchlistCacheKey(epoch);
        if (decodedData.data.screened) {
            const size = await redisApi.promiseSadd(key, symbol);
            console.log(size);
        }

        await redisApi.promiseIncr(getCacheKey("boom_requested_count", epoch));
    } catch (e) {
        console.error(e);
    }

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
