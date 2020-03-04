import { Backtester } from "../services/backtest";
import { parseISO, set } from "date-fns";
import { convertToLocalTime } from "date-fns-timezone";
import { MarketTimezone } from "../data/data.model";

const startDate = parseISO("2019-03-01 12:01:36.386Z");
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
const endDate = parseISO("2019-04-08 12:10:00.000Z");

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

const test = [
    "ECL",
    "AAPL",
    "CVS",
    "ETR",
    "JD",
    "ALL",
    "HON",
    "BA",
    "FB",
    "MSFT",
    "DPZ",
    "SPGI",
    "NVDA"
];
const instance = new Backtester(60000, zonedStartDate, zonedEndDate, test);

async function run() {
    await instance.simulate();
    console.log(JSON.stringify(instance.pastPositionConfigs));
    console.log(JSON.stringify(instance.currentPositionConfigs));
}

run().then(() => console.log("done"));
