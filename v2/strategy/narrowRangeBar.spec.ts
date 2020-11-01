import { PositionDirection } from "@neeschit/alpaca-trade-api";
import { readJsonSync, writeJSONSync } from "fs-extra";
import { Bar } from "../../src/data/data.model";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import { ceilHalf } from "../../src/util";
import { isMarketOpen } from "../../src/util/market";
import { getSafeOrbEntryPlan, NarrowRangeBarStrategy } from "./narrowRangeBar";

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
    const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
        symbol: "AAPL",
        bars,
    });
    const result = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();

    expect(result).toBeFalsy();
});

test("screener should find all narrow range bars", () => {
    const bars1 = readJsonSync("./fixtures/jnj-nrb.json");
    const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
        symbol: "JNJ",
        bars: bars1,
    });

    const result = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();

    expect(result).toBeTruthy();
    const result1 = narrowRangeBarStrategyInstance.screenForNarrowRangeBars();
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
    });

    expect(plan).toBeTruthy();
    expect(plan!.direction).toEqual(PositionDirection.long);
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
    });

    expect(plan).toBeTruthy();
    expect(plan!.direction).toEqual(PositionDirection.short);
    expect(plan!.entry).toBeGreaterThanOrEqual(120.65);
    expect(plan!.entry).toBeLessThanOrEqual(120.68);
    expect(plan!.stop).toBeLessThanOrEqual(ceilHalf(openingBar.h));
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
    });

    expect(plan).toBeTruthy();
    expect(plan!.direction).toEqual(PositionDirection.long);
    expect(plan!.entry).toBeGreaterThanOrEqual(25.63);
    expect(plan!.entry).toBeLessThanOrEqual(25.64);
    expect(plan!.limit).toEqual(plan!.entry);
    expect(plan!.stop).toBeGreaterThanOrEqual(25.48);
});
