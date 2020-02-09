const test = require("ava");
const {
    getRecentTrend,
    TrendType,
    getOverallTrend
} = require("./trendIdentifier.js");
const uptrend = require("../../fixtures/uptrend.js");
const downtrend = require("../../fixtures/downtrend.js");
const perfectDowntrend = require("../../fixtures/perfectDownTrend.js");
const perfectSidewaystrend = require("../../fixtures/perfectSidewaysTrend.js");
const perfectUptrend = require("../../fixtures/perfectUpTrend.js");

test("up trend", async t => {
    const trend = getRecentTrend(perfectUptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall", async t => {
    const trend = getOverallTrend(perfectUptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall realistic", async t => {
    const trend = getOverallTrend(uptrend);
    t.is(trend, TrendType.up);
});

test("up trend - overall manual test, no pattern", async t => {
    for (let i = 1; i < perfectUptrend.length; i++) {
        t.truthy(perfectUptrend[i].c > perfectUptrend[i - 1].c);
        t.truthy(perfectUptrend[i].h > perfectUptrend[i - 1].h);
        t.truthy(perfectUptrend[i].l > perfectUptrend[i - 1].l);
        t.truthy(perfectUptrend[i].o > perfectUptrend[i - 1].o);
    }
});

test("down trend", async t => {
    const trend = getRecentTrend(perfectDowntrend);

    t.is(trend, TrendType.down);
});

test("down trend - overall", async t => {
    const trend = getOverallTrend(perfectDowntrend);
    t.is(trend, TrendType.down);
});

test("down trend - overall manual test, no pattern", async t => {
    for (let i = 1; i < perfectDowntrend.length; i++) {
        t.truthy(perfectDowntrend[i].c < perfectDowntrend[i - 1].c);
        t.truthy(perfectDowntrend[i].h < perfectDowntrend[i - 1].h);
        t.truthy(perfectDowntrend[i].l < perfectDowntrend[i - 1].l);
        t.truthy(perfectDowntrend[i].o < perfectDowntrend[i - 1].o);
    }
});

test("down trend - overall realistic", async t => {
    const trend = getOverallTrend(downtrend);
    t.is(trend, TrendType.down);
});
