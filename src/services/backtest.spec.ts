import test from "ava";
import { parseFromTimeZone, convertToLocalTime } from "date-fns-timezone";

import { Backtester } from "./backtest";
import { set, parseISO, addMilliseconds, addDays, isEqual, isSameDay, addMonths } from "date-fns";
import { MarketTimezone, TradeDirection, TradeType, TimeInForce } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";

const updateIntervalMillis = 60000;

const defaultStartDate = parseISO("2019-01-02 12:01:36.386Z");
const defaultZonedStartDate = convertToLocalTime(
    set(defaultStartDate.getTime(), {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    }),
    {
        timeZone: MarketTimezone
    }
);
const defaultEndDate = parseISO("2019-01-03 12:10:00.000Z");
const defaultZonedEndDate = convertToLocalTime(
    set(defaultEndDate.getTime(), {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    }),
    {
        timeZone: MarketTimezone
    }
);

test("Backtester - simulate time and check if correct", async t => {
    const instance = new Backtester(
        updateIntervalMillis,
        defaultZonedStartDate,
        defaultZonedEndDate,
        []
    );

    let intervalCount = 0;

    instance.tradeUpdater.on("interval_hit", (date: Date) => {
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
    const startDate = parseISO("2019-01-01 12:00:00.000Z");
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
    const endDate = parseISO("2019-09-01 22:10:00.000Z");
    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

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
    const startDate = parseISO("2019-01-01 12:00:00.000Z");
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
    const endDate = parseISO("2019-09-01 22:10:00.000Z");
    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

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
    const startDate = parseISO("2019-03-01 12:00:00.000Z");
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
    const endDate = parseISO("2019-03-04 22:10:00.000Z");
    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

    const test = ["ECL", "AAPL", "HON"];

    const instance = new Backtester(updateIntervalMillis, zonedStartDate, zonedEndDate, test);

    await instance.simulate();

    t.is(0, instance.pendingTradeConfigs.length);
    t.is(0, instance.pastTradeConfigs.length);
    t.is(0, instance.currentPositionConfigs.length);
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
        }),
        {
            timeZone: MarketTimezone
        }
    );
    const endDate = parseISO("2019-12-05 22:10:00.000Z");
    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
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
