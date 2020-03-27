import { getHighVolumeCompanies } from "../data/filters";
import { getBarsByDate } from "../data/bars";
import { DefaultDuration, PeriodType } from "../data/data.model";
import { addDays, startOfDay } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { createWriteStream } from "fs";
import { getCacheDataName, verifyBarData } from "../util";

const highVolCompanies = getHighVolumeCompanies();

async function run(verify = false, duration = DefaultDuration.one, period = PeriodType.day) {
    for (const symbol of highVolCompanies) {
        const startDate = startOfDay(addDays(Date.now(), -365));
        const endDate = startOfDay(addDays(Date.now(), 1));
        const dailyBars = await getBarsByDate(symbol, startDate, endDate, duration, period);

        const isValid = verifyBarData(dailyBars);

        if (verify && !isValid) {
            LOGGER.warn(`Inconsistent data for ${symbol}`);
        } else {
            const writeStream = createWriteStream(
                getCacheDataName(symbol, duration, period, startDate, endDate)
            );
            writeStream.write(JSON.stringify(dailyBars));
            writeStream.close();
        }
    }
}

run().then(() => LOGGER.info("done"));
