import fastify from "fastify";
import { postHttp } from "./post";
import { getHttp } from "./get";
import cors from "fastify-cors";

export enum Service {
    streamer = 6968,
    manager = 6969,
    screener = 6970,
    backtest = 6971,
}

export const messageService = (service: Service, path: string, data?: any) => {
    return postHttp({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};

export const getFromService = <
    T extends NodeJS.Dict<
        string | number | boolean | string[] | number[] | boolean[] | null
    >
>(
    service: Service,
    path: string,
    data?: any
) => {
    return getHttp<T>({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};

const fakeServer = ({
    post: () => {},
    get: () => {},
} as any) as any;

export const getApiServer = (service: Service) => {
    if (process.env.NODE_ENV === "test") {
        return fakeServer;
    }
    const server = fastify({
        logger: true,
        ignoreTrailingSlash: true,
        bodyLimit: 1048576 * 100,
    });

    server.get("/healthcheck", async (request, reply) => {
        return "all is well";
    });

    service === Service.backtest && server.register(cors);

    server.listen(service, (err) => {
        const serverAddress = server.server && server.server.address();
        if (err || !serverAddress || typeof serverAddress === "string") {
            server.log.error("uncaught error trying to init server", err);
            process.exit(1);
        }
    });

    return server;
};
