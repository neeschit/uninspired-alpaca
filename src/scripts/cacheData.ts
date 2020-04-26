import { getMegaCaps } from "../data/filters";
import { DefaultDuration, PeriodType } from "../data/data.model";
import { addDays, startOfDay } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { getPolyonData } from "../resources/polygon";
import { insertBar, insertDailyBar } from "../resources/stockData";

const companies: string[] = getMegaCaps();

companies.push("SPY");

async function run(duration = DefaultDuration.one, period = PeriodType.minute) {
    for (const symbol of companies) {
        const startDate = startOfDay(addDays(Date.now(), -365));
        const endDate = startOfDay(addDays(Date.now(), 1));

        for (let date = startDate; date.getTime() < endDate.getTime(); date = addDays(date, 1)) {
            const daysMinutes = await getPolyonData(symbol, date, date, period, duration);

            for (let tick of daysMinutes[symbol]) {
                try {
                    await insertBar(tick, symbol, true);
                } catch (e) {
                    LOGGER.error(`Error inserting ${JSON.stringify(tick)} for ${symbol}`, e);
                }
            }
        }

        for (let date = startDate; date.getTime() < endDate.getTime(); date = addDays(date, 90)) {
            const daysMinutes = await getPolyonData(
                symbol,
                date,
                addDays(date, 90),
                period,
                duration
            );

            if (!daysMinutes[symbol] || !daysMinutes[symbol].length) {
                continue;
            }

            for (let tick of daysMinutes[symbol]) {
                try {
                    await insertDailyBar(tick, symbol);
                } catch (e) {
                    LOGGER.error(`Error inserting ${JSON.stringify(tick)} for ${symbol}`, e);
                }
            }
        }
    }
}

run().then(() => LOGGER.info("done"));
