import { format, parseISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { writeFileSync, readFileSync, appendFileSync } from "fs";
import { MarketTimezone } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { Backtester } from "../services/backtest";
import { getDetailedPerformanceReport } from "../services/performance";
import { getMegaCaps, getLargeCaps } from "../data/filters";
import { MockBroker } from "../services/mockExecution";

const startDate = "2020-10-29 09:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2020-10-29 16:40:00.000");

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
