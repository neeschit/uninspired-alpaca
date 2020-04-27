import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { readFileSync } from "fs-extra";
import { Service } from "../util/api";

const managers = [];

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

server.post("/aggregates", async (request, reply) => {
    const positions = await alpaca.getPositions();
});

server.get("/healthcheck", async (request, reply) => {
    return "all is well";
});

server.listen(Service.management, (err) => {
    const serverAddress = server.server && server.server.address();
    if (err || !serverAddress || typeof serverAddress === "string") {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`server listening on ${serverAddress.port}`);
});
