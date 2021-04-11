import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { AlpacaClient, Bar } from "@master-chief/alpaca";
import { Logging } from "@google-cloud/logging";
import { addBusinessDays, parseISO } from "date-fns";
import { Storage } from "@google-cloud/storage";

const logging = new Logging();

const log = logging.log("cache-first-bar");

const client = new AlpacaClient({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
        paper: true,
    },
    rate_limit: false,
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
        const start = new Date(date);
        const end = parseISO(`${date}T15:30:00.000Z`);

        return {
            start,
            end,
        };
    });

    const barPromises = params.map((param) => {
        console.log(`fetching for ${param.start} - ${symbol}`);
        return client.getBars({
            symbol,
            ...param,
            timeframe: "1Min",
        });
    });

    const barsResponse = await Promise.all(barPromises);

    const barsFiltered = barsResponse.map((b) => b.bars.slice(0, 5));

    const aggregatedBars: Pick<
        Bar,
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
