const test = require("ava");
const { NarrowRangeBarStrategy } = require("./narrowRangeBar.js");
const { bars, bars1, bars2 } = require("../fixtures/narrowRange.js");

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

test("nrb7 - find simple stop price", t => {
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
        console.error(e);
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
        console.error(e);
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

        const safeStop = nrbStrategyInstance.getStopPrice();
        t.is(entryPrice - safeStop, 201);
    } catch (e) {
        console.error(e);
    }
});

test("nrb7 - find simple stop price for bars1", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "BABA",
        bars: bars1
    });

    try {
        const stopPrice = nrbStrategyInstance.stop;
        t.is(stopPrice, 204.5);
    } catch (e) {
        console.error(e);
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
        t.truthy(fits);
    } catch (e) {
        console.error(e);
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
        t.is(strength, 1);
    } catch (e) {
        console.error(e);
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

        const safeStop = nrbStrategyInstance.getStopPrice();
        const stopPrice = entryPrice - safeStop;
        t.truthy(stopPrice > 47.8 && stopPrice < 47.95);
    } catch (e) {
        console.error(e);
    }
});

test("nrb7 - find simple stop price for bars2", t => {
    const nrbStrategyInstance = new NarrowRangeBarStrategy({
        period: 7,
        symbol: "TAL",
        bars: bars2
    });

    try {
        const stopPrice = nrbStrategyInstance.stop;
        t.is(stopPrice, 48);
    } catch (e) {
        console.error(e);
    }
});
