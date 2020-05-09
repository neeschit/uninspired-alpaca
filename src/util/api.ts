import fastify from "fastify";
import { postHttp } from "./post";
import { getHttp } from "./get";

export enum Service {
    streamer = 6968,
    management = 6969,
    screener = 6970,
    data = 6971,
}

export const messageService = (service: Service, path: string, data?: any) => {
    return postHttp({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};

export const getFromService = (service: Service, path: string, data?: any) => {
    return getHttp({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};

export const getApiServer = (service: Service) => {
    const server = fastify({
        logger: true,
        ignoreTrailingSlash: true,
    });

    server.get("/healthcheck", async (request, reply) => {
        return "all is well";
    });

    server.listen(service, (err) => {
        const serverAddress = server.server && server.server.address();
        if (err || !serverAddress || typeof serverAddress === "string") {
            server.log.error(err);
            process.exit(1);
        }
        server.log.info(`server listening on ${serverAddress.port}`);
    });

    return server;
};
