import { AlpacaClient } from "@master-chief/alpaca";
import { addBusinessDays } from "date-fns";
import fastify from "fastify";

const client = new AlpacaClient({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
        paper: true,
    },
    rate_limit: false,
});

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    bodyLimit: 1048576 * 100,
});

server.get("/", async (request, reply) => {
    const bars = client.getBars({
        symbol: "SPY",
        start: addBusinessDays(Date.now(), -2),
        end: new Date(),
        timeframe: "1Min",
    });

    return bars;
});

server.listen(process.env.PORT || 8080, "0.0.0.0", (err) => {
    const serverAddress = server.server && server.server.address();
    if (err || !serverAddress || typeof serverAddress === "string") {
        server.log.error("uncaught error trying to init server", err);
        process.exit(1);
    }
});

module.exports = server;
