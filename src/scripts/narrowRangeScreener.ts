import { getFilteredHighVolumeCompanies } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getData } from "../resources/stockData";
import { getDayBars, getDayBarsFormatted } from "../data/bars";
import { LOGGER } from "../instrumentation/log";

const highVolCompanies: string[] = getFilteredHighVolumeCompanies();

async function run() {
    const stockBars = await getDayBarsFormatted(highVolCompanies, 40, 0);

    let total = 0;

    for (const symbol of highVolCompanies) {
        const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
            symbol,
            bars: stockBars[symbol],
        });
        const data = await getData(narrowRangeBarStrategyInstance.symbol, 1587130200000);

        narrowRangeBarStrategyInstance.screenForNarrowRangeBars(data, 1587130200000);

        LOGGER.info(
            `symbol = ${symbol} & data is ${narrowRangeBarStrategyInstance.nrbTimestamps.join(
                "\n"
            )}`
        );

        total += narrowRangeBarStrategyInstance.nrbTimestamps.length;
    }

    LOGGER.info(total);
}

run().catch(LOGGER.error);
