import { Bucket } from "@google-cloud/storage";

export const readFileFromBucket = async (filename: string, bucket: Bucket) => {
    return new Promise((resolve, reject) => {
        const firstFiveJSONStream = bucket.file(filename).createReadStream();

        let buf = "";

        firstFiveJSONStream
            .on("data", (d) => {
                buf += d;
            })
            .on("end", () => {
                resolve(buf);
            })
            .on("error", (e) => {
                reject(e);
            });
    });
};
