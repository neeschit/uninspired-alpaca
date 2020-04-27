import test from "ava";
import { NarrowRangeBarStrategy } from "./narrowRangeBar";
import { getData } from "../resources/stockData";

const bars = [
    { v: 8.9743261e7, o: 228.08, c: 224.37, h: 228.4997, l: 212.61, t: 1584936000000, n: 1 },
    { v: 7.8564674e7, o: 236.36, c: 246.88, h: 247.69, l: 234.3, t: 1585022400000, n: 1 },
    { v: 8.1041086e7, o: 250.82, c: 245.52, h: 258.25, l: 244.3, t: 1585108800000, n: 1 },
    { v: 6.9025898e7, o: 246.52, c: 258.44, h: 258.68, l: 246.36, t: 1585195200000, n: 1 },
    { v: 5.5459075e7, o: 252.75, c: 247.74, h: 255.87, l: 247.05, t: 1585281600000, n: 1 },
    { v: 4.5309338e7, o: 250.74, c: 254.81, h: 255.52, l: 249.4, t: 1585540800000, n: 1 },
    { v: 5.4998436e7, o: 255.6, c: 254.29, h: 262.49, l: 252, t: 1585627200000, n: 1 },
    { v: 4.7390765e7, o: 246.5, c: 240.91, h: 248.72, l: 239.13, t: 1585713600000, n: 1 },
    { v: 8.8091304e7, o: 240.34, c: 244.93, h: 245.15, l: 236.9, t: 1585800000000, n: 1 },
    { v: 3.4993679e7, o: 242.8, c: 241.41, h: 245.7, l: 238.9741, t: 1585886400000, n: 1 },
    { v: 5.5144805e7, o: 250.9, c: 262.47, h: 263.11, l: 249.38, t: 1586145600000, n: 1 },
    { v: 5.3628585e7, o: 270.8, c: 259.43, h: 271.7, l: 259, t: 1586232000000, n: 1 },
    { v: 4.5178602e7, o: 262.74, c: 266.07, h: 267.37, l: 261.23, t: 1586318400000, n: 1 },
    { v: 4.2490345e7, o: 268.7, c: 267.99, h: 270.07, l: 264.7, t: 1586404800000, n: 1 },
    { v: 3.4454566e7, o: 268.31, c: 273.25, h: 273.7, l: 265.83, t: 1586750400000, n: 1 },
    { v: 1.04648013e8, o: 280, c: 287.05, h: 288.25, l: 278.05, t: 1586836800000, n: 1 },
    { v: 6.5560864e7, o: 282.4, c: 284.43, h: 286.33, l: 280.63, t: 1586923200000, n: 1 },
    { v: 1.17511702e8, o: 287.38, c: 286.69, h: 288.1975, l: 282.3502, t: 1587009600000, n: 1 },
    { v: 2.14163291e8, o: 284.69, c: 282.8, h: 286.945, l: 276.86, t: 1587096000000, n: 1 },
];
const narrowRangeBarStrategyInstance = new NarrowRangeBarStrategy({
    symbol: "AAPL",
    bars,
});
test("screener should find all narrow range bars", async (t) => {
    const data = await getData(narrowRangeBarStrategyInstance.symbol, 1587130200000);
    const endIndex = Math.max(Math.ceil(data.length / 2), 1);
    const dataSliced = data.slice(0, endIndex);

    narrowRangeBarStrategyInstance.screenForNarrowRangeBars(dataSliced, 1587141000000);
    const previousNarrowRangeBarLength = narrowRangeBarStrategyInstance.nrbTimestamps.length;
    t.truthy(narrowRangeBarStrategyInstance.nrbTimestamps.length);
    t.truthy(narrowRangeBarStrategyInstance.nrbs.length);

    t.is(narrowRangeBarStrategyInstance.nrbTimestamps[0], 1587131100000);
    t.is(narrowRangeBarStrategyInstance.lastScreenedTimestamp, 1587141000000);

    narrowRangeBarStrategyInstance.screenForNarrowRangeBars(data.slice(endIndex), 1587153600000);

    t.truthy(narrowRangeBarStrategyInstance.nrbTimestamps.length > previousNarrowRangeBarLength);
    t.is(narrowRangeBarStrategyInstance.lastScreenedTimestamp, 1587153300000);
});