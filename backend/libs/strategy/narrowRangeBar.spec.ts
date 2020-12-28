import { PositionDirection } from "@neeschit/alpaca-trade-api";
import { readJsonSync } from "fs-extra";
import { Bar } from "../core-utils/data/data.model";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import {
    getLongStop,
    getQuantityForPlan,
    getSafeOrbEntryPlan,
    getShortStop,
    NarrowRangeBarStrategy,
} from "./narrowRangeBar";

const getTestData = (bars: Bar[], entryTime: number) => {
    const marketBarsSoFar = bars.filter((b) => b.t < entryTime);

    const openingBar = marketBarsSoFar[0];

    const lastBar = marketBarsSoFar.slice(-1)[0];

    const { atr } = getAverageTrueRange(marketBarsSoFar, false, 3);

    return {
        marketBarsSoFar,
        openingBar,
        lastBar,
        currentAtr: atr!.pop()!.value,
    };
};

test("screener should find all narrow range bars", () => {
    const bars = readJsonSync("./fixtures/aapl-not-nrb.json");

    const { tr } = getAverageTrueRange(bars, false);

    const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
        symbol: "AAPL",
        bars,
        tr,
    });
    const result = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();

    expect(result).toBeFalsy();
});

test("screener should find all narrow range bars", () => {
    const bars1 = readJsonSync("./fixtures/jnj-nrb.json");
    const { tr } = getAverageTrueRange(bars1, false);
    const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
        symbol: "JNJ",
        bars: bars1,
        tr,
    });

    const result = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();

    expect(result).toBeTruthy();
    let result1 = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();
    expect(result1).toBeTruthy();
    result1 = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();
    expect(result1).toBeTruthy();
});

test("getSafeORBPlan - long", () => {
    const disBars: Bar[] = readJsonSync("./fixtures/disbars.json");

    const entryTime = 1603893600000; //10-28-2020 10 EST

    const { openingBar, lastBar, currentAtr, marketBarsSoFar } = getTestData(
        disBars,
        entryTime
    );

    const plan = getSafeOrbEntryPlan({
        symbol: "DIS",
        lastPrice: lastBar.c,
        openingBar,
        currentAtr,
        marketBarsSoFar,
        dailyAtr: 2.98,
    });

    expect(plan).toBeTruthy();
    expect(plan!.side).toEqual(PositionDirection.long);
    expect(plan!.entry).toBeGreaterThanOrEqual(121.55);
    expect(plan!.entry).toBeLessThanOrEqual(121.57);
    expect(plan!.stop).toBeGreaterThanOrEqual(openingBar.l);
});

test("getSafeORBPlan - short", () => {
    const disBars: Bar[] = readJsonSync("./fixtures/disbars.json");

    const entryTime = 1603893900000; //10-28-2020 10:05 EST

    const { marketBarsSoFar, lastBar, openingBar, currentAtr } = getTestData(
        disBars,
        entryTime
    );

    const plan = getSafeOrbEntryPlan({
        symbol: "DIS",
        lastPrice: lastBar.c,
        openingBar,
        currentAtr,
        marketBarsSoFar,
        dailyAtr: 2.98,
    });

    expect(plan).toBeTruthy();
    expect(plan!.side).toEqual(PositionDirection.short);
    expect(plan!.entry).toBeGreaterThanOrEqual(120.65);
    expect(plan!.entry).toBeLessThanOrEqual(120.68);
    expect(plan!.stop).toBeLessThanOrEqual(121.27);
    expect(plan!.stop).toBeGreaterThan(121);
});

test("getSafeORBPlan - outside range long", () => {
    const foxBars = readJsonSync("./fixtures/fox-nrb-outside-range.json");

    const entryTime = 1603893600000; //10-28-2020 10 EST

    const { marketBarsSoFar, lastBar, openingBar, currentAtr } = getTestData(
        foxBars,
        entryTime
    );

    const plan = getSafeOrbEntryPlan({
        symbol: "FOX",
        lastPrice: lastBar.c,
        openingBar,
        currentAtr,
        marketBarsSoFar,
        dailyAtr: 0.83,
    });

    expect(plan).toBeTruthy();
    expect(plan!.side).toEqual(PositionDirection.long);
    expect(plan!.entry).toBeGreaterThanOrEqual(25.63);
    expect(plan!.entry).toBeLessThanOrEqual(25.64);
    expect(plan!.limit_price).toEqual(plan!.entry);
    expect(plan!.stop).toBeGreaterThanOrEqual(25.3);
});

test("getShortStop", () => {
    const bars = readJsonSync("./fixtures/short-stop.json");

    const stop = getShortStop(bars, 0.150391678154366, 158.6723500689262);

    expect(stop).toBeGreaterThan(158.7);
    expect(stop).toBeLessThanOrEqual(158.8);
});

test("getLongStop", () => {
    const bars: Bar[] = readJsonSync("./fixtures/long-stop.json");

    const stop = getLongStop(bars, 0.1074375000000007, 120.885375);

    expect(stop).toEqual(120.79459);
});

test("make sure risk management is correct", () => {
    const quantity = getQuantityForPlan(100, {
        entry: 487.07,
        stop: 484.44,
        target: 489.71,
        side: PositionDirection.long,
        symbol: "NFLX",
        limit_price: 487.25,
    });

    expect(quantity).toEqual(35);
});
