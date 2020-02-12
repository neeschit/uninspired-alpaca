import * as https from "https";

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
    console.error(url);
    console.error(count);
    return reject(new Error("statusCode=" + response.statusCode));
};

export const get = (url: string) => {
    return new Promise((resolve, reject) => {
        let count = 0;
        const retry = () => {
            https.get(url, (response: any) => {
                count++;
                if (response.statusCode === 500 && count <= 3) {
                    retry();
                    return;
                }
                if (response.statusCode < 200 || response.statusCode >= 300) {
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
