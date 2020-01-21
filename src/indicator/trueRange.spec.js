const test = require("ava");
const { getTrueRange } = require("./trueRange.js");

test("true range - gap down", t => {
    const range = getTrueRange([
        {
            t: 1565668800,
            o: 201.05,
            h: 212.14,
            l: 200.83,
            c: 208.98,
            v: 43076897
        },
        {
            t: 1565755200,
            o: 203.16,
            h: 206.44,
            l: 202.5869,
            c: 202.75,
            v: 30918861
        }
    ]);

    t.is(range.toFixed(2), "6.39");
});

test("true range - gap up", t => {
    const range = getTrueRange([
        {
            t: 1565841600,
            o: 203.46,
            h: 205.14,
            l: 199.67,
            c: 201.74,
            v: 24575334
        },
        {
            t: 1565928000,
            o: 204.28,
            h: 207.16,
            l: 203.84,
            c: 206.44,
            v: 25086579
        }
    ]);

    t.is(range.toFixed(2), "5.42");
});

test("true range - previos close in range", t => {
    const range = getTrueRange([
        {
            t: 1565841600,
            o: 203.46,
            h: 205.14,
            l: 199.67,
            c: 204.74,
            v: 24575334
        },
        {
            t: 1565928000,
            o: 204.28,
            h: 207.16,
            l: 203.84,
            c: 206.44,
            v: 25086579
        }
    ]);

    t.is(range.toFixed(2), "3.32");
});
