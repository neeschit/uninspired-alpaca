import { format, parseISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { writeFileSync } from "fs";
import { MarketTimezone } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { Backtester } from "../services/backtest";
import { getDetailedPerformanceReport } from "../services/performance";
import { getHighVolumeCompanies, getMegaCaps } from "../data/filters";
import { MockBroker } from "../services/mockExecution";

const startDate = "2020-01-01 9:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2020-02-29 16:10:00.000");

const zonedEndDate = zonedTimeToUtc(endDate, MarketTimezone);

const SYMBOLS = getMegaCaps();
LOGGER.info(zonedStartDate.toISOString());

const pr = 1;

const simpleRange = false;

const rangeRatio = 1;

const counterTrend = false;

const nrbPeriod = 7;

const updateInterval = 60000;

const instance = new Backtester(
    MockBroker.getInstance(),
    updateInterval,
    zonedStartDate,
    zonedEndDate,
    SYMBOLS,
    pr
);

async function run() {
    const filename = `./${format(zonedStartDate, "yyyy-MM")}-${format(
        zonedEndDate,
        "yyyy-MM"
    )}-${pr}x-${rangeRatio}-${simpleRange ? "simpleRange" : "trueRange"}-${
        counterTrend ? "counter" : "trend-friend"
    }-trend-less-nrb${nrbPeriod}-${updateInterval / 60000}.json`;

    /* const pastPositionConfigs = JSON.parse(readFileSync(filename).toString()).sortedPositions;

    const performance = getDetailedPerformanceReport(pastPositionConfigs); */

    await instance.simulate(170);
    LOGGER.info(JSON.stringify(MockBroker.getInstance().getPositions()));
    const performance = getDetailedPerformanceReport(MockBroker.getInstance().pastPositionConfigs);

    writeFileSync(filename, JSON.stringify(performance));
}

run().then(() => LOGGER.info("done"));
