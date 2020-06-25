import * as http from "http";
import * as https from "https";

export const postHttp = <T extends any>({
    hostname,
    path,
    port,
    data = {} as T,
    method = "POST",
}: {
    hostname: string;
    path: string;
    port: number;
    data: T | null;
    method?: string;
}) => {
    return new Promise((resolve, reject) => {
        const dataJSON = data && JSON.stringify(data);
        const post = http.request(
            {
                hostname,
                path,
                port,
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": (dataJSON && dataJSON.length) || 0,
                },
            },
            (response) => {
                const data: string[] = [];

                response.on("data", (chunk) => {
                    data.push(chunk.toString());
                });

                response.on("end", () => {
                    resolve(data.join(""));
                });
            }
        );

        post.on("error", (e) => {
            reject(e);
        });

        dataJSON && post.write(dataJSON);
        post.end();
    });
};

export const postHttps = <T extends any>({
    hostname,
    path,
    data = null,
}: {
    hostname: string;
    path: string;
    data: T | null;
}) => {
    return new Promise((resolve, reject) => {
        const dataJSON = data && JSON.stringify(data);
        const post = https.request(
            {
                hostname,
                path,
                port: 443,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": (dataJSON && dataJSON.length) || 0,
                },
            },
            (response) => {
                const data: string[] = [];

                response.on("data", (chunk) => {
                    data.push(chunk.toString());
                });

                response.on("end", () => {
                    resolve(data.join(""));
                });
            }
        );

        post.on("error", (e) => {
            reject(e);
        });

        dataJSON && post.write(dataJSON);
        post.end();
    });
};
