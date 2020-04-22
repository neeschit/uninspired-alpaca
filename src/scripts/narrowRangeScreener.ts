import {
    getFilteredHighVolumeCompanies,
    getHighVolumeCompanies,
    getMegaCaps,
} from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getDayBarsFormatted } from "../data/bars";
import { LOGGER } from "../instrumentation/log";
import { addDays } from "date-fns";
import { getPolyonData } from "../resources/polygon";
import { PeriodType, DefaultDuration } from "../data/data.model";

const highVolCompanies: string[] = getMegaCaps();

async function run() {
    const stockBars = await getDayBarsFormatted(highVolCompanies, 40, 0);

    let total = 0;

    for (const symbol of highVolCompanies) {
        const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
            symbol,
            bars: stockBars[symbol],
        });
        const data = await getPolyonData(
            symbol,
            addDays(Date.now(), 0),
            addDays(Date.now(), 0),
            PeriodType.minute,
            DefaultDuration.fifteen
        );

        narrowRangeBarStrategyInstance.screenForNarrowRangeBars(data[symbol], Date.now());

        narrowRangeBarStrategyInstance.nrbTimestamps.length &&
            LOGGER.info(
                `symbol = ${symbol} & data is ${narrowRangeBarStrategyInstance.nrbTimestamps
                    .map((t) => new Date(t).toLocaleTimeString())
                    .join("\n")}`
            );

        total += narrowRangeBarStrategyInstance.nrbTimestamps.length;
    }

    LOGGER.info(total);
}

run().catch(LOGGER.error);
