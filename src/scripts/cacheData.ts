import { getMegaCaps, getLargeCaps, currentIndices, getUnfilteredMegaCaps } from "../data/filters";
import { DefaultDuration, PeriodType } from "../data/data.model";
import { addDays, startOfDay, addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { getPolyonData } from "../resources/polygon";
import {
    insertBar,
    insertDailyBar,
    batchInsertBars,
    dropStorageTables,
    batchInsertDailyBars,
} from "../resources/stockData";

const companies: string[] = getMegaCaps();

companies.push(...currentIndices);

async function run(duration = DefaultDuration.one, period = PeriodType.minute) {
    for (const symbol of companies) {
        const startDate = startOfDay(addBusinessDays(Date.now(), -200));
        const endDate = startOfDay(addDays(Date.now(), 1));

        for (let date = startDate; date.getTime() < endDate.getTime(); date = addDays(date, 1)) {
            const daysMinutes = await getPolyonData(symbol, date, date, period, duration);

            if (!daysMinutes[symbol] || !daysMinutes[symbol].length) {
                continue;
            }

            try {
                await batchInsertBars(daysMinutes[symbol], symbol, true);
            } catch (e) {
                LOGGER.error(`Error inserting for ${symbol}`, e);
            }
        }

        for (let date = startDate; date.getTime() < endDate.getTime(); date = addDays(date, 90)) {
            const daysMinutes = await getPolyonData(
                symbol,
                addBusinessDays(date, -90),
                addDays(Date.now(), 1),
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
