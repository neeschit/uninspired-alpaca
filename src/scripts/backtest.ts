import { Backtester } from "../services/backtest";
import { parseISO, set, format, getYear } from "date-fns";
import { MarketTimezone } from "../data/data.model";
import { readFileSync, writeFileSync } from "fs";
import { LOGGER } from "../instrumentation/log";
import { getDetailedPerformanceReport } from "../services/performance";
import { zonedTimeToUtc } from "date-fns-tz";

const startDate = "2018-01-01 9:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2019-01-01 00:10:00.000");

const zonedEndDate = zonedTimeToUtc(endDate, MarketTimezone);

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());
LOGGER.info(zonedStartDate.toISOString());

const pr = 1;

const simpleRange = false;

const rangeRatio = 1;

const counterTrend = false;

const instance = new Backtester(
    60000,
    zonedStartDate,
    zonedEndDate,
    LARGE_CAPS,
    pr,
    rangeRatio,
    simpleRange,
    counterTrend
);

async function run() {
    await instance.simulate(50);
    LOGGER.info(JSON.stringify(instance.currentPositionConfigs));

    const performance = getDetailedPerformanceReport(instance.pastPositionConfigs);

    writeFileSync(
        `./${format(zonedStartDate, "yyyy-MM")}-${format(
            zonedEndDate,
            "yyyy-MM"
        )}-${pr}x-${rangeRatio}-${simpleRange ? "simpleRange" : "trueRange"}-${counterTrend ? 'counter' : 'trend-friend'}.json`,
        JSON.stringify(performance)
    );
}

run().then(() => LOGGER.info("done"));
