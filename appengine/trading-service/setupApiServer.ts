import { Alpaca } from "@neeschit/alpaca-trade-api";
import fastify from "fastify";
import { getRedisApi } from "@neeschit/redis";
import { getWatchlistCacheKey } from "@neeschit/core-data";

import { handleEntryRequest } from "./handleEntryRequest";
import { BoomBarReply } from "@neeschit/common-interfaces";

const redisApi = getRedisApi();

export function setupServer(alpaca: Alpaca) {
    const server = fastify({
        logger: true,
        ignoreTrailingSlash: true,
        bodyLimit: 1048576 * 100,
    });

    server.post("/entry-request", async (request, reply) => {
        const event: any = request.body;

        const decodedData: BoomBarReply = JSON.parse(
            Buffer.from(event.message.data, "base64").toString()
        );

        if (
            decodedData.isInPlay &&
            decodedData.strategy === "boom" &&
            decodedData.relativeRange &&
            decodedData.relativeRange >= 2
        ) {
            const key = getWatchlistCacheKey(Date.now());
            const size = await redisApi.promiseSadd(key, decodedData.symbol);
            console.log(size);

            await handleEntryRequest({
                symbol: decodedData.symbol,
                side: decodedData.side,
                limitPrice: decodedData.limitPrice!,
                epoch: Date.now(),
                client: alpaca,
            });
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

    return server;
}
