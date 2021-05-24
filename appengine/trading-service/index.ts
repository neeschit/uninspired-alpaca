import Alpaca from "@neeschit/alpaca-trade-api";
import fastify from "fastify";
import { currentTradingSymbols } from "@neeschit/core-data";
import { PubSub } from "@google-cloud/pubsub";

const alpaca = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

const pubSubClient = new PubSub();

const stream = alpaca.data_stream_v2;

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    bodyLimit: 1048576 * 100,
});

stream.connect();

stream.onConnect(() => stream.subscribeForBars(currentTradingSymbols));

let count = 0;

stream.onStockBar((bar) => {
    count++;
    publishMessageForSymbol(bar.S);
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

function publishMessageForSymbol(symbol: string): Promise<any> {
    const dataBuffer = Buffer.from(
        JSON.stringify({
            data: {
                symbol,
                epoch: Date.now,
            },
        })
    );

    return publishMessage(dataBuffer);
}

async function publishMessage(dataBuffer: Buffer) {
    try {
        const messageId = await pubSubClient
            .topic("screening-request-channel")
            .publish(dataBuffer);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = server;
