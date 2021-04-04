import { addBusinessDays, startOfDay } from "date-fns";
import { getCalendar } from "../libs/brokerage-helpers/alpaca";
import { Bar } from "../libs/core-utils/data/data.model";
import { currentStreamingSymbols, getLargeCaps } from "@neeschit/core-data";
import { LOGGER } from "../libs/core-utils/instrumentation/log";
import {
    batchInsertFirstBars,
    checkCreateFirstBarTables,
} from "../libs/core-utils/resources/firstFiveMinBar";
import { getData } from "../libs/core-utils/resources/stockData";
import { Simulator } from "../libs/simulation-helpers/simulator";

const companies = [...getLargeCaps(), "SPY"];

const numberOfDaysBefore = (process.argv[2] && Number(process.argv[2])) || 0;

async function run() {
    const startDateConfig = numberOfDaysBefore
        ? addBusinessDays(Date.now(), -numberOfDaysBefore)
        : new Date("01-01-2017");
    const calendar = await getCalendar(new Date("01-01-2016"), new Date());

    for await (const symbol of checkCreateFirstBarTables(companies)) {
        const startDate = startOfDay(addBusinessDays(startDateConfig, -90));
        const endTime = Date.now();

        const bars: Bar[] = [];

        for (
            let date = startDate;
            date.getTime() < endTime;
            date = addBusinessDays(date, 1)
        ) {
            try {
                const marketStartEpoch = Simulator.getMarketOpenTimeForDay(
                    date.getTime(),
                    calendar
                );

                const bar = await getData(
                    symbol,
                    marketStartEpoch,
                    "5 minutes",
                    marketStartEpoch + 300000
                );

                if (bar.length) {
                    bars.push(bar[0]);
                }
            } catch (e) {
                LOGGER.error(e);
            }
        }
        console.log(bars.length + " for symbol " + symbol);

        await batchInsertFirstBars(bars, symbol);
    }
}

run().then(() => LOGGER.info("done"));
