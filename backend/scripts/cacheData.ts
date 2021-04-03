import { getLargeCaps } from "../libs/core-utils/data/filters";
import {
    DefaultDuration,
    PeriodType,
} from "../libs/core-utils/data/data.model";
import { addDays, startOfDay, addBusinessDays, endOfDay } from "date-fns";
import { LOGGER } from "../libs/core-utils/instrumentation/log";
import {
    insertBar,
    batchInsertBars,
    batchInsertDailyBars,
    getSimpleData,
} from "../libs/core-utils/resources/stockData";
import { isAfterMarketClose } from "../libs/simulation-helpers/timing.util";
import { getCalendar } from "../libs/brokerage-helpers/alpaca";
import { Simulator } from "../libs/simulation-helpers/simulator";

import { AlpacaClient } from "@master-chief/alpaca";

const client = new AlpacaClient({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
        paper: true,
    },
    rate_limit: false,
});

const companies: string[] = [...getLargeCaps(), "SPY"];

const numberOfDaysBefore = (process.argv[2] && Number(process.argv[2])) || 0;
const forceRetrieve = (process.argv[3] && Boolean(process.argv[3])) || false;

async function run(duration = DefaultDuration.one, period = PeriodType.minute) {
    const startDate = startOfDay(
        addBusinessDays(Date.now(), -numberOfDaysBefore)
    );
    const calendar = await getCalendar(
        addBusinessDays(startDate, -3),
        new Date()
    );
    const hasDayEnded = isAfterMarketClose(calendar, Date.now());
    const endDate = endOfDay(addDays(Date.now(), hasDayEnded ? 0 : -1));

    for (const symbol of companies) {
        for (
            let date = startDate;
            date.getTime() < endDate.getTime();
            date = addDays(date, 4)
        ) {
            try {
                const marketOpenTime = Simulator.getMarketOpenTimeForDay(
                    date.getTime(),
                    calendar
                );
                const firstBar = await getSimpleData(
                    symbol,
                    marketOpenTime,
                    true,
                    marketOpenTime + 300000
                );

                if (!firstBar.length || forceRetrieve) {
                    const daysMinutes = await client.getBars({
                        symbol,
                        timeframe: "1Min",
                        start: date,
                        end: addDays(date.getTime(), 3),
                    });

                    const bars = daysMinutes.bars.map((b) => ({
                        ...b,
                        t: b.t.getTime(),
                    }));

                    if (symbol === "AAPL") {
                        console.log(JSON.stringify(daysMinutes.bars));
                    }

                    try {
                        await batchInsertBars(bars, symbol, true);
                    } catch (e) {
                        LOGGER.error(`Error inserting for ${symbol}`, e);
                    }
                }
            } catch (e) {}
        }
    }

    for (const symbol of companies) {
        for (
            let date = startDate;
            date.getTime() < endDate.getTime();
            date = addBusinessDays(date, 90)
        ) {
            const end = addBusinessDays(date, 90);
            const daysMinutes = await client.getBars({
                symbol,
                timeframe: "1Min",
                start: date,
                end: addDays(date.getTime(), 3),
            });

            const bars = daysMinutes.bars.map((b) => ({
                ...b,
                t: b.t.getTime(),
            }));

            try {
                await batchInsertDailyBars(bars, symbol);
            } catch (e) {
                LOGGER.error(`Error inserting for ${symbol}`, e);
            }
        }
    }
}

run().then(() => LOGGER.info("done"));
