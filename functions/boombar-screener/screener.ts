import Alpaca, {
    AlpacaBarsV2,
    AlpacaTradesV2,
    Calendar,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { Storage } from "@google-cloud/storage";
import {
    getMarketCloseTimeForDay,
    getMarketOpenTimeForDay,
} from "@neeschit/core-data";
import { addBusinessDays, endOfDay, formatISO } from "date-fns";

const alpacaClient = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

const storage = new Storage();

const bucket = storage.bucket("first-five");

export const isBoomBar = async ({
    symbol,
    epoch,
    calendar,
}: {
    symbol: string;
    epoch: number;
    calendar: Calendar[];
}) => {
    let gap: number | null = null;

    const generator = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(addBusinessDays(epoch, -4)),
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

    const marketOpenTimeForDay = getMarketOpenTimeForDay(epoch, calendar);
    const marketCloseTimeToday = getMarketCloseTimeForDay(epoch, calendar);

    const ydayDailyBar =
        Date.now() > marketCloseTimeToday
            ? bars[bars.length - 2]
            : bars[bars.length - 1];

    const previousClose = ydayDailyBar.c;

    const firstFiveMinTodayResponse = alpacaClient.getBarsV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay),
            end: formatISO(endOfDay(epoch)),
            limit: 4,
            timeframe: "1Min",
        },
        alpacaClient.configuration
    );

    const lastMinuteTrades = alpacaClient.getTradesV2(
        symbol,
        {
            start: formatISO(marketOpenTimeForDay + 239900),
            end: formatISO(epoch),
            limit: 0,
        },
        alpacaClient.configuration
    );

    const trades: AlpacaTradesV2[] = [];

    for await (const trade of lastMinuteTrades) {
        trades.push(trade);
    }

    const reducedBar = trades.reduce(
        ({ h, l, v, c, o, t }, trade) => {
            return {
                h: trade.p > h ? trade.p : h,
                l: trade.p < l ? trade.p : l,
                v: v + trade.s,
                c,
                o,
                t,
            };
        },
        {
            h: Number.MIN_SAFE_INTEGER,
            l: Number.MAX_SAFE_INTEGER,
            v: 0,
            c: trades[trades.length - 1].p,
            o: trades[0].p,
            t: trades[trades.length - 1].t,
        }
    );

    const firstFiveBarsToday: AlpacaBarsV2[] = [];

    for await (const bar of firstFiveMinTodayResponse) {
        firstFiveBarsToday.push(bar);
    }

    firstFiveBarsToday[4] = reducedBar;

    const openToday = firstFiveBarsToday[0].o;

    gap = ((openToday - previousClose) / previousClose) * 100;

    if (gap > 1.8 || gap < -1.8) {
        return null;
    }

    const fileName = `${symbol.toLowerCase()}.json`;

    const firstFiveHistoricalAggregate: any = await readFileFromBucket(
        fileName
    );

    const firstFive: {
        averageRange: number;
        averageVolume: number;
    } = JSON.parse(firstFiveHistoricalAggregate);

    const averageRange = Math.round(firstFive.averageRange * 100) / 100;

    const averageVolume = Math.round(firstFive.averageVolume);

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

    const boomBar = {
        o: open,
        c: close,
        h: high,
        l: low,
    };

    const isBoom = isElephantBar(boomBar);

    const side =
        Math.abs(boomBar.c - boomBar.l) < Math.abs(boomBar.c - boomBar.h)
            ? TradeDirection.sell
            : TradeDirection.buy;

    const range = Math.abs(high - low);
    const rangeRatio = Math.round((range / averageRange) * 100) / 100;
    const isSignifcantlyLargeBar = rangeRatio >= 1;

    if (isBoom && !isSignifcantlyLargeBar) {
        console.log(
            symbol + " is an elephant bar but has range ratio of " + rangeRatio
        );
    }

    return isBoom && isSignifcantlyLargeBar
        ? {
              side,
              limitPrice: boomBar.c,
              relativeVolume: volume / averageVolume,
              relativeRange: rangeRatio,
          }
        : null;
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
    bar: Pick<AlpacaBarsV2, "o" | "h" | "l" | "c">,
    requiredRatio = 0.14
) => {
    const wicksRange =
        bar.o > bar.c ? Math.abs(bar.l - bar.c) : Math.abs(bar.h - bar.c);

    if (wicksRange / Math.abs(bar.h - bar.l) > requiredRatio) {
        return false;
    }

    return true;
};
