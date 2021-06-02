import { setupServer } from "./setupApiServer";
import { setupAlpacaStreams, alpaca } from "./alpaca";
import { getRedisApi } from "./redis";

setupAlpacaStreams().then(() => {
    console.log("setup alpaca streams");
});

const server = setupServer(alpaca);

module.exports = server;
