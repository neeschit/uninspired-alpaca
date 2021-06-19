import { findNarrowestBar } from "./narrowRangeBar";

const bars = [
    {
        o: 141.425,
        c: 141.38,
        h: 141.98,
        l: 140.32,
        v: 606707,
        t: "2020-10-28T13:30:00.000Z",
    },
    {
        o: 141.47,
        c: 141.25,
        h: 141.54,
        l: 141.02,
        v: 70365,
        t: "2020-10-28T13:35:00.000Z",
    },
];

test("findNarrowestBar", () => {
    const bar = findNarrowestBar(bars);

    expect(bar).not.toEqual(-1);
    expect(bar).toEqual(bars[1]);
});

test("findNarrowestBar", () => {
    const bars1 = [
        {
            o: 92.34,
            c: 92.46,
            h: 92.5893,
            l: 92.28,
            v: 29294,
            t: "2021-06-17T13:35:00Z",
        },
        {
            o: 92.455,
            c: 91.98,
            h: 92.49,
            l: 91.8729,
            v: 87614,
            t: "2021-06-17T13:40:00Z",
        },
    ];
    const bar = findNarrowestBar(bars1);

    expect(bar).not.toEqual(-1);
    expect(bar).toEqual(bars1[0]);
});
