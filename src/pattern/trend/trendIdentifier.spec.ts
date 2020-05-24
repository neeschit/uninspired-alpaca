import test from "ava";
import {
    getRecentTrend,
    TrendType,
    getOverallTrend,
    getHeuristicTrend,
    TrendPhase,
} from "./trendIdentifier";
import uptrend from "../../fixtures/uptrend";
import downtrend from "../../fixtures/downtrend";
import perfectDowntrend from "../../fixtures/perfectDownTrend";
import perfectUptrend from "../../fixtures/perfectUpTrend";
import { getPolyonData } from "../../resources/polygon";
import { PeriodType, DefaultDuration } from "../../data/data.model";
import { isMarketOpen } from "../../util/market";

test("up trend", async (t) => {
    const trend = getRecentTrend(perfectUptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall", async (t) => {
    const trend = getOverallTrend(perfectUptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall realistic", async (t) => {
    const trend = getOverallTrend(uptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall manual test, no pattern", async (t) => {
    for (let i = 1; i < perfectUptrend.length; i++) {
        t.truthy(perfectUptrend[i].c > perfectUptrend[i - 1].c);
        t.truthy(perfectUptrend[i].h > perfectUptrend[i - 1].h);
        t.truthy(perfectUptrend[i].l > perfectUptrend[i - 1].l);
        t.truthy(perfectUptrend[i].o > perfectUptrend[i - 1].o);
    }
});

test("down trend", async (t) => {
    const trend = getRecentTrend(perfectDowntrend);

    t.is(trend, TrendType.down);
});

test("down trend - overall", async (t) => {
    const trend = getOverallTrend(perfectDowntrend);
    t.is(trend, TrendType.down);
});

test("down trend - overall manual test, no pattern", async (t) => {
    for (let i = 1; i < perfectDowntrend.length; i++) {
        t.truthy(perfectDowntrend[i].c < perfectDowntrend[i - 1].c);
        t.truthy(perfectDowntrend[i].h < perfectDowntrend[i - 1].h);
        t.truthy(perfectDowntrend[i].l < perfectDowntrend[i - 1].l);
        t.truthy(perfectDowntrend[i].o < perfectDowntrend[i - 1].o);
    }
});

test("down trend - overall realistic", async (t) => {
    const trend = getOverallTrend(downtrend);
    t.is(trend, TrendType.down);
});

test("trend on a gap down and continue higher for SPY on 05/15", async (t) => {
    const bars = await getPolyonData(
        "SPY",
        new Date("2020-05-14T19:14:46.000Z"),
        new Date("2020-05-15T09:14:46.000Z"),
        PeriodType.minute,
        DefaultDuration.five
    );

    const preMarketToday = 1589546400000;

    const closeYday = 1589485200000;

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(b.t));

    const closingBarsYday = filteredBars.filter((b) => b.t > closeYday && b.t < preMarketToday);

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    t.deepEqual(lastBarYday, {
        v: 5837741,
        vw: 284.32813,
        o: 284.63,
        c: 285.05,
        h: 285.11,
        l: 284.21,
        t: 1589486100000,
        n: 27522,
    });

    let epoch = 1589549400000;
    let firstIndexForToday = -1;

    let testBars = filteredBars.filter((b, index) => {
        const isTodayMarketBar = b.t <= epoch && b.t > preMarketToday;

        if (isTodayMarketBar && firstIndexForToday === -1) {
            firstIndexForToday = index;
        }

        return isTodayMarketBar;
    });

    t.is(testBars.length, 1);

    let trend = getHeuristicTrend(lastBarYday, testBars);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05],
        troughs: [281.78],
    });
    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89],
        troughs: [281.78],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05, 282.94],
        troughs: [281.78, 281.34],
    });

    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89],
        troughs: [281.78, 281.34],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 3);

    trend = getHeuristicTrend(lastBarYday, testBars);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05, 282.94, 283.66],
        troughs: [281.78, 281.34],
    });

    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89, 283.66],
        troughs: [281.78, 281.34],
    });

    t.deepEqual(trend.secondary[1], {
        value: TrendType.up,
        trendBreakThreshold: 283.44,
        peaks: [283.66],
        troughs: [282.89],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 51);

    t.is(testBars.length, 54);

    trend = getHeuristicTrend(lastBarYday, testBars);
    t.is(trend.primary.value, TrendType.down);

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 55);

    trend = getHeuristicTrend(lastBarYday, testBars);
    t.is(trend.primary.value, TrendType.up);
});

test("trend on a gap down and reverse for SPY on 05/13", async (t) => {
    const bars = await getPolyonData(
        "SPY",
        new Date("2020-05-12T19:14:46.000Z"),
        new Date("2020-05-13T09:14:46.000Z"),
        PeriodType.minute,
        DefaultDuration.five
    );

    const preMarketToday = 1589373011000;

    const closeYday = 1589312400000;

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(b.t));

    const closingBarsYday = filteredBars.filter((b) => b.t > closeYday && b.t < preMarketToday);

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    t.deepEqual(lastBarYday, {
        v: 8212344,
        vw: 288.52673,
        o: 287.35,
        c: 286.62,
        h: 287.67,
        l: 286.55,
        t: 1589313300000,
        n: 30206,
    });

    let epoch = 1589376600000;
    let firstIndexForToday = -1;

    let testBars = filteredBars.filter((b, index) => {
        const isTodayMarketBar = b.t <= epoch && b.t > preMarketToday;

        if (isTodayMarketBar && firstIndexForToday === -1) {
            firstIndexForToday = index;
        }

        return isTodayMarketBar;
    });

    t.is(testBars.length, 1);

    let trend = getHeuristicTrend(lastBarYday, testBars);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62],
        troughs: [284.51],
    });
    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38],
        troughs: [284.51],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79],
        troughs: [284.51, 283.64],
    });

    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38, 284.79],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 3);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79],
        troughs: [284.51, 283.64],
    });
    t.deepEqual(trend.secondary[0], {
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38, 284.79],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 1);

    t.is(testBars.length, 4);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79, 285.12],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(firstIndexForToday, firstIndexForToday + testBars.length + 9);

    t.is(testBars.length, 13);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79, 285.12, 285.88, 286.48, 287.19],
        troughs: [284.51, 283.64],
    });
});
