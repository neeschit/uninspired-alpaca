import { getMegaCaps, getLargeCaps, currentIndices, getUnfilteredMegaCaps } from "../data/filters";
import { DefaultDuration, PeriodType } from "../data/data.model";
import { addDays, startOfDay, addBusinessDays, endOfDay } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { getPolyonData } from "../resources/polygon";
import {
    insertBar,
    insertDailyBar,
    batchInsertBars,
    dropStorageTables,
    batchInsertDailyBars,
} from "../resources/stockData";

const companies: string[] = getLargeCaps();

companies.push(...currentIndices);

async function run(duration = DefaultDuration.one, period = PeriodType.minute) {
    const startDate = startOfDay(addBusinessDays(Date.now(), -3));
    for (const symbol of companies) {
        const endDate = startOfDay(addBusinessDays(Date.now(), 1));

        for (
            let date = startDate;
            date.getTime() < endDate.getTime();
            date = addBusinessDays(date, 4)
        ) {
            const daysMinutes = await getPolyonData(
                symbol,
                date,
                addBusinessDays(date, 4),
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

    const endDate = endOfDay(addDays(Date.now(), -1));
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
