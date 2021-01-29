import {
    currentStreamingSymbols,
    getLargeCaps,
} from "../libs/core-utils/data/filters";
import {
    DefaultDuration,
    PeriodType,
} from "../libs/core-utils/data/data.model";
import {
    addDays,
    startOfDay,
    addBusinessDays,
    endOfDay,
    parse,
    isAfter,
} from "date-fns";
import { LOGGER } from "../libs/core-utils/instrumentation/log";
import {
    getPolyonData,
    getTickerDetails,
} from "../libs/core-utils/resources/polygon";
import {
    insertBar,
    batchInsertBars,
    batchInsertDailyBars,
    getSimpleData,
} from "../libs/core-utils/resources/stockData";
import {
    DATE_FORMAT,
    getMarketOpenMillis,
    isAfterMarketClose,
} from "../libs/simulation-helpers/timing.util";
import { getCalendar } from "../libs/brokerage-helpers/alpaca";
import { Simulator } from "../libs/simulation-helpers/simulator";

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
        const details = await getTickerDetails(symbol);

        const listDateStr = details?.listdate;

        const listdate =
            listDateStr &&
            parse(listDateStr, DATE_FORMAT, new Date(listDateStr));

        const startDateActual =
            listdate && isAfter(listdate, startDate) ? listdate : startDate;

        for (
            let date = startDateActual;
            date.getTime() < endDate.getTime();
            date = addDays(date, 4)
        ) {
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
                const daysMinutes = await getPolyonData(
                    symbol,
                    date,
                    addDays(date.getTime(), 3),
                    period,
                    duration
                );

                if (!daysMinutes[symbol] || !daysMinutes[symbol].length) {
                    continue;
                }

                try {
                    await batchInsertBars(daysMinutes[symbol], symbol, true);
                } catch (e) {
                    LOGGER.error(`Error inserting for ${symbol}`, e);

                    try {
                        for (const tick of daysMinutes[symbol]) {
                            await insertBar(tick, symbol, true);
                        }
                    } catch (e) {}
                }
            }
        }
    }

    for (const symbol of companies) {
        for (
            let date = startDate;
            date.getTime() < endDate.getTime();
            date = addBusinessDays(date, 90)
        ) {
            const end = addBusinessDays(date, 90);
            const daysMinutes = await getPolyonData(
                symbol,
                date,
                end.getTime() > endDate.getTime() ? endDate : end,
                PeriodType.day,
                DefaultDuration.one
            );

            if (!daysMinutes[symbol] || !daysMinutes[symbol].length) {
                continue;
            }

            try {
                await batchInsertDailyBars(daysMinutes[symbol], symbol);
            } catch (e) {
                LOGGER.error(`Error inserting for ${symbol}`, e);
            }
        }
    }
}

run().then(() => LOGGER.info("done"));
