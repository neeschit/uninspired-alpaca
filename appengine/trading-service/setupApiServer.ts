import { Alpaca } from "@neeschit/alpaca-trade-api";
import fastify from "fastify";

import { handleEntryRequest } from "./handleEntryRequest";
import { getRedisApi } from "./redis";

export function setupServer(alpaca: Alpaca) {
    const server = fastify({
        logger: true,
        ignoreTrailingSlash: true,
        bodyLimit: 1048576 * 100,
    });

    server.post("/entry-request", async (request, reply) => {
        const event: any = request.body;

        const decodedData = JSON.parse(
            Buffer.from(event.message.data, "base64").toString()
        );

        console.log(decodedData);

        await handleEntryRequest({
            symbol: decodedData.data.symbol,
            side: decodedData.data.side,
            limitPrice: decodedData.data.limitPrice,
            epoch: Date.now(),
            client: alpaca,
        });

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
