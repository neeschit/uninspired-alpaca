const test = require("ava");
const { NarrowRangeBarStrategy } = require("./narrowRangeBar.js");
const { bars } = require("../fixtures/narrowRange.js");

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
        console.error(e);
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
        console.error(e);
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
        console.error(e);
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
        t.is(entryPrice, 297.5);

        const safeStop = nrbStrategyInstance.getStopPrice();
        t.is(entryPrice - safeStop, 292);
    } catch (e) {
        console.error(e);
    }
});

test("nrb7 - find stop price", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "SPGI",
        bars
    });

    try {
        const stopPrice = nrbStrategyInstance.stop;
        t.is(stopPrice, 294.5);
    } catch (e) {
        console.error(e);
    }
});
