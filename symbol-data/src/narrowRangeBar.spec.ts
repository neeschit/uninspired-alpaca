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
