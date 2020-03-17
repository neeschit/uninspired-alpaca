import test from "ava";

import { Backtester } from "./backtest";
import { isSameDay, addMonths } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";

const updateIntervalMillis = 60000;

const defaultZonedStartDate = convertToLocalTime(new Date("2019-01-02"), " 08:59:00.000");
const defaultZonedEndDate = convertToLocalTime(new Date("2019-01-03"), " 03:10:00.000");

test("Backtester - simulate time and check if correct", async t => {
    LOGGER.info(defaultZonedStartDate.toLocaleString());
    LOGGER.info(defaultZonedEndDate.toLocaleString());
    const instance = new Backtester(
        updateIntervalMillis,
        defaultZonedStartDate,
        defaultZonedEndDate,
        []
    );

    let intervalCount = 0;

    instance.tradeUpdater.on("interval_hit", () => {
        intervalCount++;
    });

    let marketOpened = false;

    instance.tradeUpdater.on("market_opening", async () => {
        marketOpened = true;
    });

    await instance.simulate();

    const intervalExpected = 390;
    const forInterval = 60000;

    const multiplier = forInterval / updateIntervalMillis;

    t.is(intervalCount, intervalExpected * multiplier);

    t.is(true, marketOpened);

    t.falsy(isSameDay(defaultZonedStartDate, instance.currentDate));

    t.is(instance.currentDate.getTime(), instance.clock.now);

    instance.tradeUpdater.removeAllListeners();
});

test("Backtester - simulate batching", t => {
    const zonedStartDate = convertToLocalTime(new Date("2019-01-01"), " 12:00:00.000");
    const zonedEndDate = convertToLocalTime(new Date("2019-09-01"), " 22:10:00.000");

    const test = ["ECL", "AAPL", "HON"];

    const result = Backtester.getBatches(zonedStartDate, zonedEndDate, test);

    t.is(result.length, 2);
    const batchedEnd = addMonths(zonedStartDate, 6);
    t.deepEqual(result[0], {
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: test,
        batchId: 0
    });

    t.deepEqual(result[1], {
        startDate: batchedEnd,
        endDate: zonedEndDate,
        symbols: test,
        batchId: 0
    });
});

test("Backtester - simulate batching with symbols needing batching as well", async t => {
    const zonedStartDate = convertToLocalTime(new Date("2019-01-01"), " 12:00:00.000");
    const zonedEndDate = convertToLocalTime(new Date("2019-09-01"), " 22:10:00.000");
    const test = ["ECL", "AAPL", "HON"];

    const result = Backtester.getBatches(zonedStartDate, zonedEndDate, test, 1);

    t.is(result.length, 6);

    const batchedEnd = addMonths(zonedStartDate, 6);
    t.deepEqual(result[0], {
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["ECL"],
        batchId: 0
    });
    t.deepEqual(result[1], {
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["AAPL"],
        batchId: 1
    });
    t.deepEqual(result[2], {
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["HON"],
        batchId: 2
    });
    t.deepEqual(result[3], {
        startDate: batchedEnd,
        endDate: zonedEndDate,
        symbols: ["ECL"],
        batchId: 0
    });
    t.deepEqual(result[4], {
        startDate: batchedEnd,
        endDate: zonedEndDate,
        symbols: ["AAPL"],
        batchId: 1
    });
    t.deepEqual(result[5], {
        startDate: batchedEnd,
        endDate: zonedEndDate,
        symbols: ["HON"],
        batchId: 2
    });
});

test("Backtester - simulate everything for a few days", async t => {
    t.timeout(30000);
    const date = new Date().getTimezoneOffset() ? "02" : "01";
    const zonedStartDate = convertToLocalTime(new Date("2019-03-" + date), " 00:00:00.000");
    const endDate = new Date().getTimezoneOffset() ? "05" : "04";
    const zonedEndDate = convertToLocalTime(new Date("2019-03-" + endDate), " 08:00:00.000");

    const test = ["ECL", "AAPL", "HON"];

    const instance = new Backtester(updateIntervalMillis, zonedStartDate, zonedEndDate, test);

    await instance.simulate();

    t.is(0, instance.pendingTradeConfigs.length);
    t.is(1, instance.currentPositionConfigs.length);
    t.is(1, instance.pastTradeConfigs.length);
});
/* 
test("Backtester - simulate everything until all positions are closed", async t => {
    t.timeout(100000);
    const startDate = parseISO("2019-03-01 12:00:00.000Z");
    const zonedStartDate = convertToLocalTime(
        set(startDate.getTime(), {
            hours: 9,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        })
    );
    const endDate = parseISO("2019-12-05 22:10:00.000Z");
    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        })
    );

    const test = ["ECL", "AAPL", "HON", "CVS"];

    const instance = new Backtester(updateIntervalMillis, zonedStartDate, zonedEndDate, test);

    await instance.simulate();

    LOGGER.info(JSON.stringify(instance.pastPositionConfigs));
    LOGGER.info(JSON.stringify(instance.currentPositionConfigs));

    t.is(0, instance.pendingTradeConfigs.length);
    t.is(instance.pastPositionConfigs.length, 15);
    t.is(36, instance.pastTradeConfigs.length);
    t.is(0, instance.currentPositionConfigs.length);
});
 */
