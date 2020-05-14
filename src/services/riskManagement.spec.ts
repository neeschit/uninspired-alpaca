import test from "ava";
import { assessRisk, getActualStop } from "./riskManagement";

const volumeProfile = [
    { v: 4810450, low: 161, high: 162 },
    { v: 3852439, low: 172, high: 173 },
    { v: 3427163, low: 159, high: 160 },
    { v: 3425983, low: 170, high: 171 },
    { v: 3349023, low: 171, high: 172 },
    { v: 3125488, low: 162, high: 163 },
    { v: 2257652, low: 160, high: 161 },
    { v: 1866337, low: 169, high: 170 },
    { v: 1504542, low: 155, high: 156 },
    { v: 1490521, low: 167, high: 168 },
    { v: 1251576, low: 173, high: 174 },
    { v: 1221615, low: 175, high: 176 },
    { v: 1177901, low: 169, high: 170 },
    { v: 1030246, low: 163, high: 164 },
    { v: 944478, low: 159, high: 160 },
    { v: 941042, low: 165, high: 166 },
    { v: 898020, low: 174, high: 175 },
    { v: 739647, low: 157, high: 158 },
    { v: 651037, low: 157, high: 158 },
    { v: 568277, low: 168, high: 168 },
    { v: 478648, low: 165, high: 166 },
];

test("risk management with low price override ", (t) => {
    const dailyAtr = 2;

    const intradayAtr = 0.2;

    const currentPrice = 65;

    t.is(assessRisk(dailyAtr, intradayAtr, currentPrice), 0.3);
});

test("risk management with intraday override", (t) => {
    const dailyAtr = 2;

    const intradayAtr = 0.45;

    const currentPrice = 65;

    t.is(assessRisk(dailyAtr, intradayAtr, currentPrice), 0.45);
});

test("risk management with override for mid price", (t) => {
    const dailyAtr = 5.63;

    const intradayAtr = 0.57;

    const currentPrice = 143;

    t.is(assessRisk(dailyAtr, intradayAtr, currentPrice), 0.7);
});

test("risk management with high price override", (t) => {
    const dailyAtr = 8;

    const intradayAtr = 0.56;

    const currentPrice = 301;

    t.is(assessRisk(dailyAtr, intradayAtr, currentPrice), 1);
});

test("get actual stop with rounding to lowest - short entry", (t) => {
    let actualStop = getActualStop(143, 0.57, true, 8.63);

    t.is(actualStop, 144.08);

    actualStop = getActualStop(143, 0.87, true, 5.63);

    t.is(actualStop, 144.06);
});

test("get actual stop with rounding to lowest - long entry", (t) => {
    let actualStop = getActualStop(143, 0.57, false, 5.63);

    t.is(actualStop, 142.3);

    actualStop = getActualStop(143, 0.87, false, 5.63);

    t.is(actualStop, 141.94);
});

test("risk management with super high price override", (t) => {
    const dailyAtr = 41;

    const intradayAtr = 2.56;

    const currentPrice = 765;

    t.is(assessRisk(dailyAtr, intradayAtr, currentPrice), 5.13);
});

test("get actual stop for large price stock", (t) => {
    let actualStop = getActualStop(765, 2.56, false, 41);

    t.is(actualStop, 761.5);
});
