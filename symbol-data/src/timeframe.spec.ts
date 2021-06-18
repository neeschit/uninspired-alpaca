import { groupMinuteBarsAndReduce } from "./timeframe";
const bars = [
    {
        v: 504448,
        sym: "TEST",
        a: 140.8438,
        o: 141.425,
        c: 140.7,
        h: 141.98,
        l: 140.4,
        t: new Date(1603891800000).toISOString(),
        n: 1700,
    },
    {
        v: 23489,
        sym: "TEST",
        a: 140.6164,
        o: 140.67,
        c: 140.45,
        h: 140.75,
        l: 140.44,
        t: new Date(1603891860000).toISOString(),
        n: 374,
    },
    {
        v: 20120,
        sym: "TEST",
        a: 140.6472,
        o: 140.38,
        c: 140.7,
        h: 140.85,
        l: 140.32,
        t: new Date(1603891920000).toISOString(),
        n: 380,
    },
    {
        v: 25650,
        sym: "TEST",
        a: 140.9221,
        o: 140.775,
        c: 141.13,
        h: 141.13,
        l: 140.77,
        t: new Date(1603891980000).toISOString(),
        n: 420,
    },
    {
        v: 33000,
        sym: "TEST",
        a: 141.0848,
        o: 141.02,
        c: 141.38,
        h: 141.43,
        l: 140.85,
        t: new Date(1603892040000).toISOString(),
        n: 435,
    },
    {
        v: 14861,
        sym: "TEST",
        a: 141.2334,
        o: 141.47,
        c: 141.095,
        h: 141.54,
        l: 141.02,
        t: new Date(1603892100000).toISOString(),
        n: 345,
    },
    {
        v: 21541,
        sym: "TEST",
        a: 141.1528,
        o: 141.15,
        c: 141.3,
        h: 141.3,
        l: 141.05,
        t: new Date(1603892160000).toISOString(),
        n: 317,
    },
    {
        v: 13638,
        sym: "TEST",
        a: 141.2435,
        o: 141.23,
        c: 141.249,
        h: 141.3,
        l: 141.1647,
        t: new Date(1603892220000).toISOString(),
        n: 250,
    },
    {
        v: 10684,
        sym: "TEST",
        a: 141.3102,
        o: 141.21,
        c: 141.41,
        h: 141.47,
        l: 141.17,
        t: new Date(1603892280000).toISOString(),
        n: 206,
    },
    {
        v: 9641,
        sym: "TEST",
        a: 141.2544,
        o: 141.4,
        c: 141.25,
        h: 141.4,
        l: 141.11,
        t: new Date(1603892340000).toISOString(),
        n: 237,
    },
];

test("groupMinuteBarsAndReduce", () => {
    const fiveMinuteBars = groupMinuteBarsAndReduce(bars);

    expect(fiveMinuteBars.length).toEqual(2);
    expect(fiveMinuteBars[0].o).toEqual(141.425);
    expect(fiveMinuteBars[1].o).toEqual(141.47);
    expect(fiveMinuteBars[0].c).toEqual(141.38);
    expect(fiveMinuteBars[1].c).toEqual(141.25);
    expect(fiveMinuteBars[0].h).toEqual(141.98);
    expect(fiveMinuteBars[1].h).toEqual(141.54);
    expect(fiveMinuteBars[0].l).toEqual(140.32);
    expect(fiveMinuteBars[1].l).toEqual(141.02);
    expect(fiveMinuteBars[0].v).toEqual(606707);
    expect(fiveMinuteBars[1].v).toEqual(70365);
});
