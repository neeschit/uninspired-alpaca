import { AlpacaClient, AlpacaStream, Bar } from "@master-chief/alpaca";
import { addBusinessDays } from "date-fns";
import fastify from "fastify";
import { currentTradingSymbols } from "@neeschit/core-data";

const client = new AlpacaClient({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
        paper: true,
    },
    rate_limit: false,
});

const stream = new AlpacaStream({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
    },
    type: "market_data",
    source: "sip",
});

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    bodyLimit: 1048576 * 100,
});

let count = 0;

stream.once("authenticated", () =>
    stream.subscribe("bars", currentTradingSymbols)
);

stream.on("bar", (bar: Bar) => {
    count++;
});

server.get("/", async (request, reply) => {
    return count;
});

server.listen(process.env.PORT || 8080, "0.0.0.0", (err) => {
    const serverAddress = server.server && server.server.address();
    if (err || !serverAddress || typeof serverAddress === "string") {
        server.log.error("uncaught error trying to init server", err);
        process.exit(1);
    }
});

module.exports = server;
