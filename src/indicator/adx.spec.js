const test = require("ava");
const uptrend = require("../pattern/fixtures/uptrend.js");
const downtrend = require("../pattern/fixtures/downtrend.js");
const { getAverageDirectionalIndex } = require("./adx.js");

test("getAdx - uptrend", t => {
    const [adx, pdx, ndx] = getAverageDirectionalIndex(uptrend);

    t.is(adx[adx.length - 1].value, 42.45438184588078);
});

test("getAdx - downtrend", t => {
    const [adx, pdx, ndx] = getAverageDirectionalIndex(downtrend);

    t.is(adx[adx.length - 1].value, 33.29778261226684);
});
