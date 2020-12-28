import {
    currentIndices,
    getMegaCaps,
} from "../../libs/core-utils/data/filters";
import {
    DefaultDuration,
    PeriodType,
} from "../../libs/core-utils/data/data.model";
import { addDays, startOfDay, addBusinessDays, endOfDay } from "date-fns";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { getPolyonData } from "../../libs/core-utils/resources/polygon";
import {
    insertBar,
    batchInsertBars,
    batchInsertDailyBars,
} from "../../libs/core-utils/resources/stockData";
import { isAfterMarketClose } from "../../v2/simulation-helpers/timing.util";
import { getCalendar } from "../../v2/brokerage-helpers/alpaca";

const companies: string[] = getMegaCaps();

companies.push(...currentIndices);

async function run(duration = DefaultDuration.one, period = PeriodType.minute) {
    const startDate = startOfDay(addBusinessDays(Date.now(), -1));
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

    const calendar = await getCalendar(new Date(), new Date());
    const hasDayEnded = isAfterMarketClose(calendar, Date.now());

    for (const symbol of companies) {
        const endDate = endOfDay(addDays(Date.now(), hasDayEnded ? 0 : -1));
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
