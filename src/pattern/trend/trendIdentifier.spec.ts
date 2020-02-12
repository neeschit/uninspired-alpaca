import test from "ava";
import { getRecentTrend, TrendType, getOverallTrend } from "./trendIdentifier";
import uptrend from "../../fixtures/uptrend";
import downtrend from "../../fixtures/downtrend";
import perfectDowntrend from "../../fixtures/perfectDownTrend";
import perfectSidewaystrend from "../../fixtures/perfectSidewaysTrend";
import perfectUptrend from "../../fixtures/perfectUpTrend";

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
