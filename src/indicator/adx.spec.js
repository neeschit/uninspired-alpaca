const test = require("ava");
const uptrend = require("../pattern/fixtures/uptrend.js");
const { getAverageDirectionalIndex } = require("./adx.js");

test("getAdx", t => {
    const [adx, pdx, ndx] = getAverageDirectionalIndex(uptrend);

    t.is(adx[adx.length - 1], 59.542563917980964);
});
