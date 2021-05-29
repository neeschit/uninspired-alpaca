import Alpaca, {
    AlpacaBarsV2,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { Storage } from "@google-cloud/storage";
import { getMarketOpenTimeForDay } from "@neeschit/core-data";
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
}: {
    symbol: string;
    epoch: number;
}) => {
    const calendar = await alpacaClient.getCalendar({
        start: new Date(epoch),
        end: new Date(epoch),
    });

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

    const openToday = bars[bars.length - 1].o;
    const previousClose = bars[bars.length - 2].c;

    gap = ((openToday - previousClose) / previousClose) * 100;

    if (gap > 1.8 || gap < -1.8) {
        return null;
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

    return isBoom && Math.abs(high - low) > 2 * Math.abs(averageRange)
        ? { side, limitPrice: boomBar.c }
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
    bar: Pick<AlpacaBarsV2, "o" | "h" | "l" | "c">
) => {
    const bodyRange = Math.abs(bar.o - bar.c);
    const wicksRange =
        bar.o > bar.c
            ? Math.abs(bar.h - bar.o) + Math.abs(bar.l - bar.c)
            : Math.abs(bar.h - bar.c) + Math.abs(bar.l - bar.o);

    if (wicksRange / (wicksRange + bodyRange) > 0.35) {
        return false;
    }

    return true;
};
