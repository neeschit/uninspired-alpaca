import test from "ava";

import { Backtester } from "./backtest";
import { isSameDay, addMonths, parseISO } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";
import {
    PositionDirection,
    OrderStatus,
    TradeDirection,
    TradeType,
    TimeInForce
} from "../data/data.model";
import { MockBroker } from "./mockExecution";

const updateIntervalMillis = 60000;

test("Backtester - simulate time and check if correct", async t => {
    const defaultZonedStartDate = new Date("2019-01-03T08:10:00.000Z");
    const defaultZonedEndDate = new Date("2019-01-03T22:10:00.000Z");
    LOGGER.info(defaultZonedStartDate.toLocaleString());
    LOGGER.info(defaultZonedEndDate.toLocaleString());
    const instance = new Backtester(
        MockBroker.getInstance(),
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
