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
    return reject(new Error("statusCode=" + response.statusCode));
};

export const get = (url: string) => {
    LOGGER.debug(url);
    return new Promise((resolve, reject) => {
        let count = 0;
        const retry = () => {
            https.get(url, (response: any) => {
                count++;
                const isError = response.statusCode < 200 || response.statusCode >= 300;
                if (response.statusCode >= 300 && count <= 3) {
                    retry();
                    return;
                }
                if (isError) {
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
