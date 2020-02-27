import test from "ava";
import { assessRisk } from "./riskManagement";

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
    { v: 478648, low: 165, high: 166 }
];

test("risk management - basic - should identify nearest high quality stop loss", t => {
    const risk = assessRisk(
        volumeProfile,
        {
            t: 1580878800000,
            value: 3.7687595434568366
        },
        /* 169.11675925278186, */
        170.42,
        169.5,
        171.7
    );

    t.is(risk, 3.5);
});

test("risk management - risky - should recognize tight stop and ", t => {
    const risk = assessRisk(
        volumeProfile,
        {
            t: 1580878800000,
            value: 2.0687595434568366
        },
        /* 169.11675925278186, */
        170.42,
        169.4,
        171.7
    );

    t.true(risk > 1.6 && risk < 1.8);
});
