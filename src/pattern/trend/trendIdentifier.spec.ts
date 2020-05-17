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
import perfectSidewaystrend from "../../fixtures/perfectSidewaysTrend";
import perfectUptrend from "../../fixtures/perfectUpTrend";
import { getPolyonData } from "../../resources/polygon";
import { PeriodType, DefaultDuration } from "../../data/data.model";
import { alpaca } from "../../resources/alpaca";
import { confirmMarketOpen, isMarketOpen } from "../../util/market";

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

    let testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 1);

    let trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        phase: TrendPhase.initial,
        details: {
            peak: {
                previous: 285.05,
                current: 282.89,
            },
            trough: {
                previous: 0,
                current: 281.78,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.initial);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.06,
        phase: TrendPhase.initial,
        details: {
            peak: {
                previous: 282.89,
                current: 282.92,
            },
            trough: {
                previous: 281.78,
                current: 281.34,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 3);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.06,
        phase: TrendPhase.big_move,
        details: {
            peak: {
                previous: 282.92,
                current: 283.6,
            },
            trough: {
                previous: -1,
                current: 281.34,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 4);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 285.06,
        details: {
            peak: {
                previous: 282.92,
                current: 283.6,
            },
            trough: {
                previous: 281.34,
                current: 282.84,
            },
        },
    });

    epoch += 300000;
    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 5);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 285.06,
        details: {
            peak: {
                previous: 283.6,
                current: 284.21,
            },
            trough: {
                previous: 281.34,
                current: 282.84,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 6);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.06,
        phase: TrendPhase.big_move,
        details: {
            peak: {
                previous: 283.6,
                current: 284.21,
            },
            trough: {
                previous: 281.34,
                current: 282.84,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 7);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 285.06,
        details: {
            peak: {
                previous: 283.6,
                current: 284.3,
            },
            trough: {
                previous: 282.84,
                current: 283.49,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 8);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.06,
        phase: TrendPhase.big_move,
        details: {
            peak: {
                previous: 283.6,
                current: 284.3,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 9);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.fizzle,
        trendBreakThreshold: 285.06,
        details: {
            peak: {
                previous: 284.21,
                current: 284.88,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 10);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.fizzle,
        trendBreakThreshold: 285.06,
        details: {
            peak: {
                previous: 284.21,
                current: 285.07,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 11);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        trendBreakThreshold: 285.06,
        phase: TrendPhase.fizzle,
        details: {
            peak: {
                previous: 284.21,
                current: 285.07,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });
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

    let testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 1);

    let trend = getHeuristicTrend(lastBarYday, testBars);
    t.is(trend.primary.phase, TrendPhase.initial);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.initial,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 286.62,
                current: 286.38,
            },
            trough: {
                previous: 0,
                current: 284.51,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.initial);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.initial,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 286.35,
                current: 284.79,
            },
            trough: {
                previous: 284.51,
                current: 283.65,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 3);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.initial);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.initial,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 286.35,
                current: 284.79,
            },
            trough: {
                previous: 284.51,
                current: 283.65,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 4);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.truthy(trend.secondary);
    t.truthy(trend.secondary!.length);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 284.88,
                current: 285.12,
            },
            trough: {
                previous: 283.65,
                current: 283.87,
            },
        },
    });

    epoch += 300000;
    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 5);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 284.88,
                current: 285.2,
            },
            trough: {
                previous: 283.65,
                current: 283.87,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 6);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 284.88,
                current: 285.2,
            },
            trough: {
                previous: 283.87,
                current: 284.25,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 7);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 285.2,
                current: 285.87,
            },
            trough: {
                previous: 283.87,
                current: 284.25,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 8);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.big_move);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.big_move,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 285.2,
                current: 286.08,
            },
            trough: {
                previous: 283.87,
                current: 284.25,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 9);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.is(trend.secondary!.length, 2);
    t.is(trend.secondary![1].value, TrendType.down);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.fizzle,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 285.2,
                current: 286.08,
            },
            trough: {
                previous: 0,
                current: 285.55,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 10);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.fizzle,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 284.21,
                current: 285.07,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });

    epoch += 300000;

    testBars = filteredBars.filter((b) => b.t <= epoch && b.t > preMarketToday);

    t.is(testBars.length, 11);

    trend = getHeuristicTrend(lastBarYday, testBars);

    t.is(trend.primary.phase, TrendPhase.fizzle);
    t.deepEqual(trend.primary, {
        value: TrendType.down,
        phase: TrendPhase.fizzle,
        trendBreakThreshold: 286.62,
        details: {
            peak: {
                previous: 284.21,
                current: 285.07,
            },
            trough: {
                previous: 282.84,
                current: 283.4,
            },
        },
    });
});
