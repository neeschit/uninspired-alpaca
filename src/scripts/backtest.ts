import { Backtester } from "../services/backtest";
import { parseISO, set, format } from "date-fns";
import { MarketTimezone } from "../data/data.model";
import { readFileSync } from "fs";
import { LOGGER } from "../instrumentation/log";
import { getDetailedPerformanceReport } from "../services/performance";
import { zonedTimeToUtc } from "date-fns-tz";

const startDate = "2016-01-01 9:00:00.000";
const zonedStartDate = zonedTimeToUtc(startDate, MarketTimezone);

const endDate = parseISO("2020-03-15 16:10:00.000");

const zonedEndDate = zonedTimeToUtc(endDate, MarketTimezone);

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());
LOGGER.info(zonedStartDate.toISOString());
const instance = new Backtester(60000, zonedStartDate, zonedEndDate, LARGE_CAPS);

async function run() {
    await instance.simulate(50);
    LOGGER.info(JSON.stringify(instance.currentPositionConfigs));

    const performance = getDetailedPerformanceReport(instance.pastPositionConfigs);

    LOGGER.info(JSON.stringify(performance));
}

run().then(() => LOGGER.info("done"));
