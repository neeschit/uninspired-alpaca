import {
    getRecentTrend,
    TrendType,
    getOverallTrend,
    getHeuristicTrend,
    TrendPhase,
} from "./trendIdentifier";
import perfectDowntrend from "../../testUtil/perfectDownTrend";
import perfectUptrend from "../../testUtil/perfectUpTrend";
import { getPolyonData } from "../../resources/polygon";
import { PeriodType, DefaultDuration } from "../../data/data.model";
import { readJSONSync } from "fs-extra";
import { Calendar } from "@neeschit/alpaca-trade-api";
import { getCalendar } from "../../../v2/brokerage-helpers/alpaca";
import { isMarketOpen } from "../../../v2/simulation-helpers/timing.util";

const downtrend = readJSONSync("./fixtures/downtrend.json") as any;
const uptrend = readJSONSync("./fixtures/uptrend.json") as any;

test("up trend", async () => {
    const trend = getRecentTrend(perfectUptrend);
    expect(trend).toEqual(TrendType.up);
});

test("up trend - overall", async (t) => {
    const trend = getOverallTrend(perfectUptrend);
    expect(trend).toEqual(TrendType.up);
});

test("up trend - overall realistic", async (t) => {
    const trend = getOverallTrend(uptrend);
    expect(trend).toEqual(TrendType.up);
});

test("up trend - overall manual test, no pattern", async (t) => {
    for (let i = 1; i < perfectUptrend.length; i++) {
        expect(perfectUptrend[i].c > perfectUptrend[i - 1].c).toBeTruthy();
        expect(perfectUptrend[i].h > perfectUptrend[i - 1].h).toBeTruthy();
        expect(perfectUptrend[i].l > perfectUptrend[i - 1].l).toBeTruthy();
        expect(perfectUptrend[i].o > perfectUptrend[i - 1].o).toBeTruthy();
    }
});

test("down trend", async (t) => {
    const trend = getRecentTrend(perfectDowntrend);

    expect(trend).toEqual(TrendType.down);
});

test("down trend - overall", async (t) => {
    const trend = getOverallTrend(perfectDowntrend);
    expect(trend).toEqual(TrendType.down);
});

test("down trend - overall manual test, no pattern", async (t) => {
    for (let i = 1; i < perfectDowntrend.length; i++) {
        expect(perfectDowntrend[i].c < perfectDowntrend[i - 1].c).toBeTruthy();
        expect(perfectDowntrend[i].h < perfectDowntrend[i - 1].h).toBeTruthy();
        expect(perfectDowntrend[i].l < perfectDowntrend[i - 1].l).toBeTruthy();
        expect(perfectDowntrend[i].o < perfectDowntrend[i - 1].o).toBeTruthy();
    }
});

test("down trend - overall realistic", async (t) => {
    const trend = getOverallTrend(downtrend);
    expect(trend).toEqual(TrendType.down);
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

    const calendar: Calendar[] = await getCalendar(
        new Date(preMarketToday),
        new Date(preMarketToday)
    );

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(calendar, b.t));

    const closingBarsYday = filteredBars.filter(
        (b) => b.t > closeYday && b.t < preMarketToday
    );

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    expect(lastBarYday).toStrictEqual({
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

    expect(testBars.length).toEqual(1);

    let trend = getHeuristicTrend(lastBarYday, testBars);
    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05],
        troughs: [281.78],
    });
    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89],
        troughs: [281.78],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars.length).toEqual(2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05, 282.94],
        troughs: [281.78, 281.34],
    });

    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89],
        troughs: [281.78, 281.34],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars.length).toEqual(3);

    trend = getHeuristicTrend(lastBarYday, testBars);
    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 285.05,
        peaks: [285.05, 282.94, 283.66],
        troughs: [281.78, 281.34],
    });

    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 282.89,
        peaks: [282.89, 283.66],
        troughs: [281.78, 281.34],
    });

    expect(trend.secondary[1]).toStrictEqual({
        value: TrendType.up,
        trendBreakThreshold: 283.44,
        peaks: [283.66],
        troughs: [282.89],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 51
    );

    expect(testBars.length).toEqual(54);

    trend = getHeuristicTrend(lastBarYday, testBars);
    expect(trend.primary.value).toEqual(TrendType.down);
    expect(trend.secondary.length).toEqual(4);

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars[testBars.length - 1].t).toEqual(1589565600000); // 15th may 2020 at 1400 hrs
    expect(testBars.length).toEqual(55);

    trend = getHeuristicTrend(lastBarYday, testBars);
    expect(trend.primary.value).toEqual(TrendType.up);
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

    const calendar: Calendar[] = await getCalendar(
        new Date(preMarketToday),
        new Date(preMarketToday)
    );

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(calendar, b.t));

    const closingBarsYday = filteredBars.filter(
        (b) => b.t > closeYday && b.t < preMarketToday
    );

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    expect(lastBarYday).toStrictEqual({
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

    expect(testBars.length).toEqual(1);

    let trend = getHeuristicTrend(lastBarYday, testBars);
    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62],
        troughs: [284.51],
    });
    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38],
        troughs: [284.51],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars.length).toEqual(2);

    trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79],
        troughs: [284.51, 283.64],
    });

    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38, 284.79],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars.length).toEqual(3);

    trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79],
        troughs: [284.51, 283.64],
    });
    expect(trend.secondary[0]).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.38,
        peaks: [286.38, 284.79],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 1
    );

    expect(testBars.length).toEqual(4);

    trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79, 285.12],
        troughs: [284.51, 283.64],
    });

    testBars = filteredBars.slice(
        firstIndexForToday,
        firstIndexForToday + testBars.length + 9
    );

    expect(testBars.length).toEqual(13);

    trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary).toStrictEqual({
        value: TrendType.down,
        trendBreakThreshold: 286.62,
        peaks: [286.62, 284.79, 285.12, 285.88, 286.48, 287.19],
        troughs: [284.51, 283.64],
    });
});

test("trend on a gap up and reverse for AMT on 05/20", async (t) => {
    const bars = await getPolyonData(
        "AMT",
        new Date("2020-05-19T19:14:46.000Z"),
        new Date("2020-05-20T09:14:46.000Z"),
        PeriodType.minute,
        DefaultDuration.five
    );

    const preMarketToday = 1589977200000;

    const closeYday = 1589916000000;

    const calendar: Calendar[] = await getCalendar(
        new Date(preMarketToday),
        new Date(preMarketToday)
    );

    const filteredBars = bars["AMT"].filter((b) => isMarketOpen(calendar, b.t));

    const closingBarsYday = filteredBars.filter(
        (b) => b.t > closeYday && b.t < preMarketToday
    );

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    let epoch = 1589984100000;
    let firstIndexForToday = -1;

    let testBars = filteredBars.filter((b, index) => {
        const isTodayMarketBar = b.t <= epoch && b.t > preMarketToday;

        if (isTodayMarketBar && firstIndexForToday === -1) {
            firstIndexForToday = index;
        }

        return isTodayMarketBar;
    });

    expect(testBars.length).toEqual(10);

    let trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary.value).toEqual(TrendType.up);
    expect(trend.secondary[trend.secondary.length - 1].value).toEqual(
        TrendType.up
    );
});

test("trend on a gap up and reverse for SPY on 05/20", async (t) => {
    const bars = await getPolyonData(
        "SPY",
        new Date("2020-05-19T19:14:46.000Z"),
        new Date("2020-05-20T09:14:46.000Z"),
        PeriodType.minute,
        DefaultDuration.five
    );

    const preMarketToday = 1589977200000;

    const closeYday = 1589916000000;

    const calendar: Calendar[] = await getCalendar(
        new Date(preMarketToday),
        new Date(preMarketToday)
    );

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(calendar, b.t));

    const closingBarsYday = filteredBars.filter(
        (b) => b.t > closeYday && b.t < preMarketToday
    );

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    let epoch = 1589982900000;
    let firstIndexForToday = -1;

    let testBars = filteredBars.filter((b, index) => {
        const isTodayMarketBar = b.t <= epoch && b.t > preMarketToday;

        if (isTodayMarketBar && firstIndexForToday === -1) {
            firstIndexForToday = index;
        }

        return isTodayMarketBar;
    });

    expect(testBars.length).toEqual(6);

    let trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary.value).toEqual(TrendType.up);
    expect(trend.secondary[trend.secondary.length - 1].value).toEqual(
        TrendType.up
    );
});

test("trend on a gap up and reverse for SPY on 05/19", async (t) => {
    const bars = await getPolyonData(
        "SPY",
        new Date("2020-05-18T19:14:46.000Z"),
        new Date("2020-05-29T09:14:46.000Z"),
        PeriodType.minute,
        DefaultDuration.five
    );

    const preMarketToday = 1589890800000;

    const closeYday = 1589829600000;

    const calendar: Calendar[] = await getCalendar(
        new Date(preMarketToday),
        new Date(preMarketToday)
    );

    const filteredBars = bars["SPY"].filter((b) => isMarketOpen(calendar, b.t));

    const closingBarsYday = filteredBars.filter(
        (b) => b.t > closeYday && b.t < preMarketToday
    );

    const lastBarYday = closingBarsYday[closingBarsYday.length - 1];

    let epoch = 1589896800000;
    let firstIndexForToday = -1;

    let testBars = filteredBars.filter((b, index) => {
        const isTodayMarketBar = b.t <= epoch && b.t > preMarketToday;

        if (isTodayMarketBar && firstIndexForToday === -1) {
            firstIndexForToday = index;
        }

        return isTodayMarketBar;
    });

    expect(testBars.length).toEqual(7);

    let trend = getHeuristicTrend(lastBarYday, testBars);

    expect(trend.primary.value).toEqual(TrendType.down);
    expect(
        trend.secondary[trend.secondary.length - 1].trendBreakThreshold
    ).toEqual(294.84);
    expect(trend.secondary[trend.secondary.length - 1].value).toEqual(
        TrendType.up
    );
    expect(trend.secondary.length).toEqual(2);
});
