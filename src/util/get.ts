import * as https from "https";
import { LOGGER } from "../instrumentation/log";

const logError = ({
    url,
    count,
    reject,
    response
}: {
    response: any;
    url: string;
    count: number;
    reject: any;
}) => {
    LOGGER.error(url);
    LOGGER.error(count);
    return reject(
        `response: ${Object.keys(response)}`,
        new Error("statusCode=" + response.statusCode)
    );
};

export const get = (url: string) => {
    LOGGER.warn(url);
    return new Promise((resolve, reject) => {
        let count = 0;
        const retry = () => {
            https.get(url, (response: any) => {
                count++;
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    if (response.statusCode === 500) {
                        retry();
                        return;
                    }
                    if (count < 15) {
                        LOGGER.error(
                            `for url ${url}\nresponse: ${response.statusMessage}\n statusCode= ${response.statusCode})`
                        );
                        retry();
                        return;
                    }
                    return logError({ url, response, reject, count });
                }
                let body: any[] = [];
                response.on("data", function(chunk: any) {
                    body.push(chunk);
                });

                response.on("end", function() {
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
    });
};
