import test from "ava";
import { parseFromTimeZone, convertToLocalTime } from "date-fns-timezone";

import { Backtester } from "./backtest";
import {
    set,
    parseISO,
    addMilliseconds,
    addDays,
    isEqual,
    isSameDay
} from "date-fns";
import { MarketTimezone, TradeDirection, TradeType, TimeInForce } from "../data/data.model";

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
    const instance = new Backtester(60000, defaultZonedStartDate, defaultZonedEndDate, []);

    let intervalCount = 0;

    instance.tradeUpdater.on("interval_hit", (date: Date) => {
        intervalCount++;
    });

    let marketOpened = false;

    instance.tradeUpdater.on("market_opening", async () => {
        marketOpened = true;
    });

    await instance.simulate();

    t.is(intervalCount, 390);

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

    const instance = new Backtester(60000, zonedStartDate, zonedEndDate, test);

    await instance.simulate();

    t.is(0, instance.pendingTradeConfigs.length);
    t.is(2, instance.currentPositionConfigs.length);
    t.is(2, instance.pastTradeConfigs.length);
});


test("Backtester - simulate everything until all positions are closed", async t => {
    t.timeout(60000);
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
    const endDate = parseISO("2019-03-31 22:10:00.000Z");
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

    const instance = new Backtester(60000, zonedStartDate, zonedEndDate, test);

    await instance.simulate();

    t.is(0, instance.pendingTradeConfigs.length);
    t.is(8, instance.pastTradeConfigs.length);
    t.is(4, instance.pastPositionConfigs.length);
    t.is(0, instance.currentPositionConfigs.length);
});
