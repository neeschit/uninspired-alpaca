import * as https from "https";
import * as http from "http";
import { stringify } from "querystring";
import { LOGGER } from "../instrumentation/log";

const logError = ({
    url,
    count,
    reject,
    response,
}: {
    response: any;
    url: string;
    count: number;
    reject: any;
}) => {
    /* LOGGER.error(url); */
    LOGGER.error(count);
    return reject(
        `response: ${Object.keys(response)}`,
        new Error("statusCode=" + response.statusCode)
    );
};

export const getHttps = <T>(url: string): Promise<T> => {
    LOGGER.warn(url);
    return new Promise<any>((resolve, reject): void => {
        let count = 0;
        const retry = () => {
            https.get(url, (response: any) => {
                count++;
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    if (response.statusCode === 500) {
                        retry();
                        return;
                    }
                    if (count < 15 && response.statusCode !== 404) {
                        LOGGER.error(
                            `for url ${url}\nresponse: ${response.statusMessage}\n statusCode= ${response.statusCode})`
                        );
                        retry();
                        return;
                    }
                    return logError({ url, response, reject, count });
                }
                let body: any[] = [];
                response.on("data", function (chunk: any) {
                    body.push(chunk);
                });

                response.on("end", function () {
                    try {
                        body = JSON.parse(Buffer.concat(body).toString());
                    } catch (e) {
                        reject(e);
                    }
                    resolve(body);
                });
            });
        };
        retry();
    }).catch(LOGGER.error);
};

export const getHttp = <
    T extends NodeJS.Dict<
        string | number | boolean | string[] | number[] | boolean[] | null
    >
>({
    hostname,
    path,
    data,
    port = "",
}: {
    hostname: string;
    path: string;
    data?: T;
    port?: string | number;
}) => {
    const dataJSON = data && "?" + stringify(data);
    const url = `http://${hostname}${port && ":" + port}${path}${
        dataJSON ? dataJSON : ""
    }`;
    LOGGER.warn(url);
    return new Promise((resolve, reject) => {
        let count = 0;
        const retry = () => {
            const get = http.request(
                {
                    hostname,
                    port,
                    path,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": (dataJSON && dataJSON.length) || 0,
                    },
                },
                (response: any) => {
                    count++;
                    if (
                        response.statusCode < 200 ||
                        response.statusCode >= 300
                    ) {
                        if (response.statusCode === 500) {
                            retry();
                            return;
                        }
                        if (count < 15 && response.statusCode !== 404) {
                            LOGGER.error(
                                `for url ${url}\nresponse: ${response.statusMessage}\n statusCode= ${response.statusCode})`
                            );
                            retry();
                            return;
                        }
                        return logError({ url, response, reject, count });
                    }
                    let body: any[] = [];
                    response.on("data", function (chunk: any) {
                        body.push(chunk);
                    });

                    response.on("end", function () {
                        try {
                            body = JSON.parse(Buffer.concat(body).toString());
                        } catch (e) {
                            reject(e);
                        }
                        resolve(body);
                    });
                }
            );

            dataJSON && get.write(dataJSON);

            get.on("error", (e) => {
                reject(e);
            });

            get.end();
        };
        retry();
    });
};
