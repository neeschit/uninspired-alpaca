import { Backtester } from "../services/backtest";
import { parseISO, set, format, getYear } from "date-fns";
import { MarketTimezone } from "../data/data.model";
import { readFileSync, writeFileSync } from "fs";
import { LOGGER } from "../instrumentation/log";
import { getDetailedPerformanceReport } from "../services/performance";
import { zonedTimeToUtc } from "date-fns-tz";

const startDate = "2019-10-01 9:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2020-03-24 00:10:00.000");

const zonedEndDate = zonedTimeToUtc(endDate, MarketTimezone);

const LARGE_CAPS = JSON.parse(readFileSync("./largeCapsHighVolume.json").toString());
LOGGER.info(zonedStartDate.toISOString());

const pr = 2;

const simpleRange = true;

const rangeRatio = 1;

const counterTrend = false;

const nrbPeriod = 7;

const instance = new Backtester(
    60000,
    zonedStartDate,
    zonedEndDate,
    LARGE_CAPS,
    pr,
    rangeRatio,
    simpleRange,
    counterTrend,
    nrbPeriod
);

async function run() {
    const filename = `./${format(zonedStartDate, "yyyy-MM")}-${format(
        zonedEndDate,
        "yyyy-MM"
    )}-${pr}x-${rangeRatio}-${simpleRange ? "simpleRange" : "trueRange"}-${
        counterTrend ? "counter" : "trend-friend"
    }-shorter-dmi-nrb${nrbPeriod}-no-adx-strict-entry.json`;

    /* const pastPositionConfigs = JSON.parse(readFileSync(filename).toString()).sortedPositions;

    const performance = getDetailedPerformanceReport(pastPositionConfigs); */

    await instance.simulate(170);
    LOGGER.info(JSON.stringify(instance.currentPositionConfigs));
    const performance = getDetailedPerformanceReport(instance.pastPositionConfigs);

    writeFileSync(filename, JSON.stringify(performance));
}

run().then(() => LOGGER.info("done"));
