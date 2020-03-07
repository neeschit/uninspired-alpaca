import test from "ava";
import { parseFromTimeZone, convertToLocalTime } from "date-fns-timezone";

import { Backtester } from "./backtest";
import { set, parseISO, addMilliseconds, addDays, isEqual, isSameDay } from "date-fns";
import { MarketTimezone, TradeDirection, TradeType, TimeInForce } from "../data/data.model";

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
/* 
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
    t.is(2, instance.pastTradeConfigs.length);
    t.is(2, instance.currentPositionConfigs.length);
});

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
    const endDate = parseISO("2019-05-01 22:10:00.000Z");
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
    t.truthy(9 <= instance.pastPositionConfigs.length && instance.pastPositionConfigs.length <= 10);
    t.truthy(23 <= instance.pastTradeConfigs.length && instance.pastPositionConfigs.length <= 25);
    t.is(0, instance.currentPositionConfigs.length);

    console.log(JSON.stringify(instance.pastPositionConfigs));
    console.log(JSON.stringify(instance.currentPositionConfigs));
});
 */
test("Backtester - simulate batching", async t => {
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

    const instance = new Backtester(updateIntervalMillis, zonedStartDate, zonedEndDate, test);

    const result = await instance.simulate();

    t.is(result, null);
});
