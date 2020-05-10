import fastify from "fastify";
import { postHttp } from "./post";
import { getHttp } from "./get";
import { Server, IncomingMessage, ServerResponse } from "http";

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

export const getFromService = <T>(service: Service, path: string, data?: any) => {
    return getHttp<T>({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};

export const getApiServer = (service: Service) => {
    if (process.env.NODE_ENV === "test") {
        return ({
            post: () => {},
            get: () => {},
        } as any) as fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;
    }
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
