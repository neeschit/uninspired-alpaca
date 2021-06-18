import { getTrueRange, getAverageTrueRange } from "./trueRange";

test("true range - gap down", () => {
    const range = getTrueRange(
        [
            {
                t: new Date(1565668800).toISOString(),
                o: 201.05,
                h: 212.14,
                l: 200.83,
                c: 208.98,
                v: 43076897,
            },
            {
                t: new Date(1565755200).toISOString(),
                o: 203.16,
                h: 206.44,
                l: 202.5869,
                c: 202.75,
                v: 30918861,
            },
        ],
        false
    );

    expect(range.toFixed(2)).toEqual("6.39");
});

test("true range - gap up", () => {
    const range = getTrueRange(
        [
            {
                t: new Date(1565841600).toISOString(),
                o: 203.46,
                h: 205.14,
                l: 199.67,
                c: 201.74,
                v: 24575334,
            },
            {
                t: new Date(1565928000).toISOString(),
                o: 204.28,
                h: 207.16,
                l: 203.84,
                c: 206.44,
                v: 25086579,
            },
        ],
        false
    );

    expect(range.toFixed(2)).toEqual("5.42");
});

test("true range - previos close in range", () => {
    const range = getTrueRange(
        [
            {
                t: new Date(1565841600).toISOString(),
                o: 203.46,
                h: 205.14,
                l: 199.67,
                c: 204.74,
                v: 24575334,
            },
            {
                t: new Date(1565928000).toISOString(),
                o: 204.28,
                h: 207.16,
                l: 203.84,
                c: 206.44,
                v: 25086579,
            },
        ],
        false
    );

    expect(range.toFixed(2)).toEqual("3.32");
});

test("atr", () => {
    const { atr } = getAverageTrueRange(fixtures, false);
    expect(atr).toStrictEqual([
        { value: 5.828000000000003, t: fixtures[1].t },
        { value: 5.941600000000004, t: fixtures[2].t },
        { value: 5.694720000000004, t: fixtures[3].t },
        { value: 5.432757333333336, t: fixtures[4].t },
        { value: 5.161723022222225, t: fixtures[5].t },
        { value: 4.9321599525925945, t: fixtures[6].t },
        { value: 5.281205292246913, t: fixtures[7].t },
        { value: 5.038924586613992, t: fixtures[8].t },
        { value: 4.736401308398794, t: fixtures[9].t },
        { value: 4.387547800612289, t: fixtures[10].t },
        { value: 4.1532080938639835, t: fixtures[11].t },
        { value: 4.038113681348788, t: fixtures[12].t },
        { value: 4.127698523835617, t: fixtures[13].t },
        { value: 3.9210987206575325, t: fixtures[14].t },
        { value: 3.834285557903196, t: fixtures[15].t },
    ]);
});

const fixtures = [
    {
        t: new Date(1569988800).toISOString(),
        o: 223.06,
        h: 223.35,
        l: 217.93,
        c: 218.96,
        v: 30918110,
    },
    {
        t: new Date(1570075200).toISOString(),
        o: 218.43,
        h: 220.96,
        l: 215.132,
        c: 220.81,
        v: 25785193,
    },
    {
        t: new Date(1570161600).toISOString(),
        o: 225.64,
        h: 227.49,
        l: 223.89,
        c: 227.01,
        v: 61420683,
    },
    {
        t: new Date(1570420800).toISOString(),
        o: 226.27,
        h: 229.93,
        l: 225.84,
        c: 227.06,
        v: 55939194,
    },
    {
        t: new Date(1570507200).toISOString(),
        o: 225.82,
        h: 228.06,
        l: 224.33,
        c: 224.39,
        v: 49356153,
    },
    {
        t: new Date(1570593600).toISOString(),
        o: 227.03,
        h: 227.79,
        l: 225.64,
        c: 227,
        v: 33424472,
    },
    {
        t: new Date(1570680000).toISOString(),
        o: 227.93,
        h: 230.44,
        l: 227.3,
        c: 230.09,
        v: 50995288,
    },
    {
        t: new Date(1570766400).toISOString(),
        o: 232.95,
        h: 237.64,
        l: 232.3075,
        c: 236.22,
        v: 75801862,
    },
    {
        t: new Date(1571025600).toISOString(),
        o: 234.9,
        h: 238.1342,
        l: 234.6701,
        c: 235.89,
        v: 43959865,
    },
    {
        t: new Date(1571112000).toISOString(),
        o: 236.39,
        h: 237.65,
        l: 234.88,
        c: 235.32,
        v: 37286507,
    },
    {
        t: new Date(1571198400).toISOString(),
        o: 233.37,
        h: 235.24,
        l: 233.2,
        c: 234.39,
        v: 32693993,
    },
    {
        t: new Date(1571284800).toISOString(),
        o: 235.09,
        h: 236.15,
        l: 233.52,
        c: 235.29,
        v: 30936663,
    },
    {
        t: new Date(1571371200).toISOString(),
        o: 234.59,
        h: 237.58,
        l: 234.29,
        c: 236.28,
        v: 45791251,
    },
    {
        t: new Date(1571630400).toISOString(),
        o: 238.3659,
        h: 240.99,
        l: 238.32,
        c: 240.53,
        v: 17427391,
    },
    {
        t: new Date(1571716800).toISOString(),
        o: 241.16,
        h: 242.2,
        l: 239.6218,
        c: 239.97,
        v: 19060536,
    },
    {
        t: new Date(1571803200).toISOString(),
        o: 242.1,
        h: 243.24,
        l: 241.22,
        c: 243.14,
        v: 17199153,
    },
];
