import { postHttp } from "./post";

export enum Service {
    management = 6969,
    screener = 6970,
}

export const notifyService = (service: Service, path: string, data: any) => {
    return postHttp({
        hostname: "localhost",
        port: service,
        path,
        data,
    });
};
