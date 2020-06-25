import { format, parseISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { writeFileSync, openSync, readFileSync, appendFileSync } from "fs";
import { MarketTimezone } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { Backtester } from "../services/backtest";
import { getDetailedPerformanceReport } from "../services/performance";
import { getMegaCaps, getLargeCaps, getUnfilteredMegaCaps } from "../data/filters";
import { MockBroker } from "../services/mockExecution";
import { remove } from "fs-extra";

const startDate = "2019-01-01 9:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2020-06-24 16:10:00.000");

const zonedEndDate = zonedTimeToUtc(endDate, MarketTimezone);

const SYMBOLS = getMegaCaps();
LOGGER.info(zonedStartDate.toISOString());

const pr = 3;

const updateInterval = 60000;

const now = Date.now();

const instance = new Backtester(
    MockBroker.getInstance(),
    updateInterval,
    zonedStartDate,
    zonedEndDate,
    SYMBOLS,
    pr
);

async function run() {
    const filename = `./${format(zonedStartDate, "yyyy-MM-dd")}-${format(
        zonedEndDate,
        "yyyy-MM-dd"
    )}-${pr}-${now}`;

    /* const pastPositionConfigs = JSON.parse(readFileSync(filename).toString()).sortedPositions;

    const performance = getDetailedPerformanceReport(pastPositionConfigs); */

    const positionsFile = `${filename}-positions.json`;
    await instance.simulate(500, positionsFile);
    appendFileSync(positionsFile, "]");
    const positions = JSON.parse(readFileSync(positionsFile).toString());
    const performance = getDetailedPerformanceReport(positions);
    writeFileSync(`${filename}.json`, JSON.stringify(performance));
}

run().then(() => LOGGER.info("done"));
