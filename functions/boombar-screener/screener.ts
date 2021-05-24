import * as redis from "redis";
import Alpaca, { AlpacaBarsV2 } from "@neeschit/alpaca-trade-api";
import { Storage } from "@google-cloud/storage";
import { getCacheKey, getMarketOpenTimeForDay } from "@neeschit/core-data";
import { addDays, endOfDay, formatISO } from "date-fns";

const alpacaClient = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

const storage = new Storage();

const bucket = storage.bucket("first-five");

export const client = redis.createClient({
    host: "redis-18495.c9.us-east-1-2.ec2.cloud.redislabs.com",
    port: 18495,
    password: process.env.REDIS_KEY!,
    disable_resubscribing: true,
});

export const isBoomBar = async ({
    symbol,
    epoch,
}: {
    symbol: string;
    epoch: number;
}) => {
    const symbolCacheKey = getCacheKey(`${symbol}_cache_`, epoch);

    const symbolCache = client.get(symbolCacheKey);

    const calendar = await alpacaClient.getCalendar({
        start: new Date(epoch),
        end: new Date(epoch),
    });

    let gap: number | null = null;

    if (!symbolCache) {
        const generator = alpacaClient.getBarsV2(
            symbol,
            {
                start: formatISO(addDays(epoch, -2)),
                end: formatISO(epoch),
                timeframe: "1Day",
                limit: 10,
            },
            alpacaClient.configuration
        );

        const bars = [];

        for await (let b of generator) {
            bars.push(b);
        }

        const openToday = bars[bars.length - 1].o;
        const previousClose = bars[bars.length - 2].c;

        gap = ((openToday - previousClose) / previousClose) * 100;
    }

    if (!gap) {
        throw new Error("couldnt find gap");
    }

    if (gap > 1.8 || gap < -1.8) {
        return false;
    }

    const fileName = `${symbol.toLowerCase()}.json`;

    const firstFiveHistoricalAggregate: any = await readFileFromBucket(
        fileName
    );

    const averageRange = JSON.parse(firstFiveHistoricalAggregate).averageRange;

    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);

    const firstFiveMinTodayResponse = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay),
            end: formatISO(endOfDay(epoch)),
            limit: 5,
            timeframe: "1Min",
        },
        alpacaClient.configuration
    );

    const firstFiveBarsToday: AlpacaBarsV2[] = [];

    for await (const bar of firstFiveMinTodayResponse) {
        firstFiveBarsToday.push(bar);
    }

    const { high, low, volume } = firstFiveBarsToday.reduce(
        ({ high, low, volume }, bar) => {
            return {
                high: bar.h > high ? bar.h : high,
                low: bar.l < low ? bar.l : low,
                volume: volume + bar.v,
            };
        },
        {
            high: firstFiveBarsToday[0].h,
            low: firstFiveBarsToday[0].l,
            volume: 0,
        }
    );

    const open = firstFiveBarsToday[0].o;
    const close = firstFiveBarsToday[firstFiveBarsToday.length - 1].c;

    const isBoom = isElephantBar({
        o: open,
        c: close,
        h: high,
        l: low,
    });

    return isBoom;
};

export const readFileFromBucket = async (filename: string) => {
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

export const isElephantBar = (
    bar: Pick<AlpacaBarsV2, "o" | "h" | "l" | "c">
) => {
    console.log(bar);
    const bodyRange = Math.abs(bar.o - bar.c);
    const wicksRange =
        bar.o > bar.c
            ? Math.abs(bar.h - bar.o) + Math.abs(bar.l - bar.c)
            : Math.abs(bar.h - bar.c) + Math.abs(bar.l - bar.o);

    if (wicksRange / bodyRange > 0.15) {
        return false;
    }

    return true;
};
