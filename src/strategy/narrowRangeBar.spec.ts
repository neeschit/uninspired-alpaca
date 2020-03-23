import test from "ava";
import { NarrowRangeBarStrategy } from "./narrowRangeBar";
import { bars, bars1, bars2 } from "../fixtures/narrowRange";
import { getBarsByDate } from "../data/bars";
import {
    DefaultDuration,
    PeriodType,
    TradeDirection,
    TradeType,
    TimeInForce
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";

test("nrb7 - identify", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars
    });

    try {
        const fits = nrbStrategyInstance.checkIfFitsStrategy();
        t.truthy(fits);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - check strength", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars
    });

    try {
        const strength = nrbStrategyInstance.checkStrength();
        t.is(strength, 1);
    } catch (e) {
        LOGGER.error(e);
    }

    const newBars = bars.slice();

    newBars.push({
        v: 1.957126e6,
        o: 297.31,
        c: 295.48,
        h: 296.62,
        l: 295.04,
        t: 1581206400000,
        n: 1
    });

    const nrbStrategyInstance1 = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars: newBars
    });

    try {
        t.is(nrbStrategyInstance1.checkStrength(), 2);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find entry price", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars
    });

    try {
        const entryPrice = nrbStrategyInstance.entry;
        t.is(entryPrice, 294.5);

        const safeStop = nrbStrategyInstance.stop;
        t.is(entryPrice - safeStop, 289);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find simple stop price", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars
    });

    try {
        const stopPrice = nrbStrategyInstance.simpleStop;
        t.is(stopPrice, 297.5);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - identify for bars1", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BABA",
        bars: bars1
    });

    try {
        const fits = nrbStrategyInstance.checkIfFitsStrategy();
        t.truthy(fits);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - check strength for bars1", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BABA",
        bars: bars1
    });

    try {
        const strength = nrbStrategyInstance.checkStrength();
        t.is(strength, 1);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find entry price bars1", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BABA",
        bars: bars1
    });

    try {
        const entryPrice = nrbStrategyInstance.entry;
        t.is(entryPrice, 208);

        const safeStop = nrbStrategyInstance.stop;
        t.is(entryPrice + safeStop, 212);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find simple stop price for bars1", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BABA",
        bars: bars1
    });

    try {
        const stopPrice = nrbStrategyInstance.simpleStop;
        t.is(stopPrice, 204.5);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - identify for bars2", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    try {
        const fits = nrbStrategyInstance.checkIfFitsStrategy();
        t.falsy(fits);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - check strength for bars2", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    try {
        const strength = nrbStrategyInstance.checkStrength();
        t.is(strength, 0);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find entry price bars2", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    try {
        const entryPrice = nrbStrategyInstance.entry;
        t.is(entryPrice, 50);

        const safeStop = nrbStrategyInstance.stop;
        const stopPrice = nrbStrategyInstance.isShort
            ? entryPrice + safeStop
            : entryPrice - safeStop;
        t.truthy(stopPrice > 47.8 && stopPrice < 48);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - find simple stop price for bars2", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    try {
        const stopPrice = nrbStrategyInstance.simpleStop;
        t.is(stopPrice, 48);
    } catch (e) {
        LOGGER.error(e);
    }
});

test("nrb7 - isTimeForEntry", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    t.truthy(nrbStrategyInstance.isTimeForEntry(new Date("2020-12-24T14:34:46.000Z")));
    t.truthy(nrbStrategyInstance.isTimeForEntry(new Date("2020-12-24T14:35:46.000Z")));
    t.truthy(nrbStrategyInstance.isTimeForEntry(new Date("2020-12-24T14:34:45.000Z")));
    t.truthy(nrbStrategyInstance.isTimeForEntry(new Date("2020-12-24T14:35:59.000Z")));
    t.truthy(nrbStrategyInstance.isTimeForEntry(new Date("2020-12-24T14:36:00.000Z")));
});

test("integration nrb - real world - identify pattern for BDX", async t => {
    const bars = await getBarsByDate(
        "BDX",
        new Date("2019-10-01"),
        new Date("2020-01-22T21:34:46.000Z"),
        DefaultDuration.one,
        PeriodType.day
    );
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BDX",
        bars
    });

    t.falsy(nrbStrategyInstance.checkIfFitsStrategy());
});

test("integration nrb - real world - identify pattern for AKAM", async t => {
    const bars = await getBarsByDate(
        "AKAM",
        new Date("2019-10-01"),
        new Date("2020-01-22T21:34:46.000Z"),
        DefaultDuration.one,
        PeriodType.day
    );
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "AKAM",
        bars
    });

    t.truthy(nrbStrategyInstance.checkIfFitsStrategy());
    const trade = await nrbStrategyInstance.rebalance(
        {
            h: 95.5,
            l: 95,
            c: 95.4,
            o: 95,
            v: 3000,
            t: Date.now()
        },
        new Date("2020-01-22T14:34:46.000Z")
    );
    t.deepEqual(trade, {
        symbol: "AKAM",
        quantity: 7,
        side: TradeDirection.sell,
        type: TradeType.stop,
        tif: TimeInForce.day,
        price: 95,
        t: trade!.t
    });
});
