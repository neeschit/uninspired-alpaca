import { Backtester } from "../services/backtest";
import { parseISO, set } from "date-fns";
import { convertToLocalTime } from "date-fns-timezone";
import { MarketTimezone } from "../data/data.model";
import { readFileSync } from "fs";
import { LOGGER } from "../instrumentation/log";
import { getDetailedPerformanceReport } from "../services/performance";

const startDate = parseISO("2018-10-01 12:01:36.386Z");
const zonedStartDate = convertToLocalTime(
    set(startDate.getTime(), {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    }),
    {
        timeZone: MarketTimezone
    }
);
const endDate = parseISO("2020-03-09 12:10:00.000Z");

const zonedEndDate = convertToLocalTime(
    set(endDate.getTime(), {
        hours: 16,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    }),
    {
        timeZone: MarketTimezone
    }
);
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
