import fastify from "fastify";
import { getRedisApi } from "@neeschit/redis";
import { getCachedAtrKey } from "@neeschit/core-data";
import { getDailyAtr } from "./atr";

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    bodyLimit: 1048576 * 100,
});

const redisApi = getRedisApi();

server.get("/", async () => {
    return true;
});

server.get("/dailyAtr", async (request: { query: any }) => {
    const epoch = Number(request.query.epoch);
    const symbol = request.query.symbol;
    try {
        const cacheKey = getCachedAtrKey(epoch, symbol);
        const atrCached = await redisApi.promiseGet(cacheKey);
        if (!atrCached) {
            const atr = await getDailyAtr({ epoch, symbol });

            await redisApi.promiseSet(cacheKey, atr.toString());

            return atr;
        } else {
            console.log("returning cached atr");
            return Number(atrCached);
        }
    } catch (e) {
        return 0;
    }
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
