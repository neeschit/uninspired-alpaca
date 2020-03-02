import test from "ava";
import { parseFromTimeZone, convertToLocalTime } from "date-fns-timezone";
import sinon from "sinon";

import { Backtester } from "./backtest";
import { set, parseISO, addMilliseconds, addDays, isEqual } from "date-fns";
import { MarketTimezone } from "../data/data.model";

test("Backtester - simulate days", t => {
    const startDate = parseISO("2019-01-01 12:01:36.386Z");
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
    const endDate = parseISO("2019-01-02 12:10:00.000Z");

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

    const clock = sinon.useFakeTimers(zonedStartDate.getTime());

    const instance = new Backtester(60000, zonedStartDate, zonedEndDate, []);

    instance.init();

    let intervalCount = 0;

    instance.tradeUpdater.on("interval_hit", (date: Date) => {
        intervalCount++;
    });

    clock.tick(60000 * 60 * 26);

    t.is(intervalCount, 391);

    clock.restore();

    instance.tradeUpdater.removeAllListeners();
});

test("Backtester - fetch bars for simulation and respect current date", async t => {
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
    const endDate = parseISO("2019-03-31 12:10:00.000Z");

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

    const test = ["ECL", "AAPL", "CVS"];

    const instance = new Backtester(60000, zonedStartDate, zonedEndDate, test);

    let symbols = await instance.getScreenedSymbols();

    t.is(1, symbols.length);

    t.is(symbols[0].symbol, "ECL");

    instance.goToNextDay();

    symbols = await instance.getScreenedSymbols();

    symbols.map(symbol => console.log(symbol.toString()));

    t.is(2, symbols.length);

    t.deepEqual(
        symbols.map(s => s.symbol),
        ["ECL", "CVS"]
    );
});

test("Backtester - gotonextday", t => {
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
    const endDate = parseISO("2019-03-31 12:10:00.000Z");

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

    const clock = sinon.useFakeTimers(zonedStartDate.getTime());

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

    instance.goToNextDay();

    t.falsy(isEqual(zonedStartDate, instance.currentDate));
});

test("Backtester - simulate a whole month and report for few symbols", async t => {
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
    const endDate = parseISO("2019-03-31 12:10:00.000Z");

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

    const clock = sinon.useFakeTimers(zonedStartDate.getTime());

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

    instance.init();

    instance.tradeUpdater.on(
        "interval_hit",
        async (date1, date2) => await instance.handleTickUpdate(date1, date2)
    );

    let marketOpened = false;

    instance.tradeUpdater.on("market_opening", async () => {
        marketOpened = true;
    });

    clock.tick(60000);

    instance.tradeUpdater.removeAllListeners();

    t.is(true, marketOpened);
});
