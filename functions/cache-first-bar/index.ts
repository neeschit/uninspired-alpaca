import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import Alpaca, { AlpacaBarsV2 } from "@neeschit/alpaca-trade-api";
import {
    addBusinessDays,
    addHours,
    endOfDay,
    formatISO,
    parseISO,
} from "date-fns";
import { Storage } from "@google-cloud/storage";
import { getMarketOpenTimeForDay } from "@neeschit/core-data";

const client = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

const storage = new Storage();

const bucket = storage.bucket("first-five");

export const cacheFirstBar: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: { data: { symbol: string } } = JSON.parse(
        Buffer.from(dataBuffer, "base64").toString()
    );

    const symbol = data.data.symbol;

    const calendars = await client.getCalendar({
        start: addBusinessDays(Date.now(), -90),
        end: new Date(),
    });

    const fileName = `${symbol.toLowerCase()}.json`;

    const params = calendars.map((calendar) => {
        const date = calendar.date;
        const start = addHours(new Date(date), 12);
        const end = parseISO(`${date}T15:30:00.000Z`);

        return {
            start,
            end,
        };
    });

    const barPromises = params.map(async (param) => {
        const marketOpenTimeForDay = getMarketOpenTimeForDay(
            param.start.getTime(),
            calendars
        );

        const barsResponseGenerator = client.getBarsV2(
            symbol,
            {
                start: formatISO(marketOpenTimeForDay),
                end: formatISO(endOfDay(marketOpenTimeForDay)),
                limit: 4,
                timeframe: "1Min",
            },
            client.configuration
        );

        const bars: AlpacaBarsV2[] = [];

        for await (const b of barsResponseGenerator) {
            bars.push(b);
        }

        return bars;
    });

    const barsResponse = await Promise.all(barPromises);

    const barsFiltered = barsResponse
        .filter((b) => b.length)
        .map((b) => b.slice(0, 5));

    const aggregatedBars: Pick<
        AlpacaBarsV2,
        "o" | "h" | "l" | "c" | "v" | "t"
    >[] = barsFiltered.map((bars) => {
        const { high, low, volume } = bars.reduce(
            ({ high, low, volume }, bar) => {
                return {
                    high: bar.h > high ? bar.h : high,
                    low: bar.l < low ? bar.l : low,
                    volume: volume + bar.v,
                };
            },
            {
                high: bars[0].h,
                low: bars[0].l,
                volume: 0,
            }
        );

        return {
            h: high,
            v: volume,
            t: bars[0].t,
            o: bars[0].o,
            c: bars[bars.length - 1].c,
            l: low,
        };
    });

    const { totalVolume, totalRange } = aggregatedBars.reduce(
        ({ totalVolume, totalRange }, bar) => {
            const range = Math.abs(bar.h - bar.l);
            return {
                totalVolume: bar.v + totalVolume,
                totalRange: totalRange + range,
            };
        },
        { totalVolume: 0, totalRange: 0 }
    );

    const averageVolume = totalVolume / aggregatedBars.length;
    const averageRange = totalRange / aggregatedBars.length;

    await saveFile(fileName, {
        bars: aggregatedBars,
        averageRange,
        averageVolume,
    });

    console.log(`done without error for ${symbol}`);
};

const saveFile = async (fileName: string, data: any) => {
    const file = bucket.file(fileName);

    await file.save(JSON.stringify(data));
};
