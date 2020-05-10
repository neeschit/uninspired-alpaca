import test from "ava";
import {
    getCacheItems,
    refreshSecondAggregateSubscribers,
    defaultSubscriptions,
} from "./socketDataStreaming.handlers";

test("refresh subscriptions", (t) => {
    const subs = refreshSecondAggregateSubscribers([{ symbol: "AAPL" }]);

    let cache = getCacheItems();
    const defaults = defaultSubscriptions;

    t.is(Object.keys(cache).length, 1, "expected 1 new item in the cache");

    t.is(subs[0], "A.AAPL");

    const subs1 = refreshSecondAggregateSubscribers([{ symbol: "AAPL" }, { symbol: "AMT" }]);
    cache = getCacheItems();

    t.is(Object.keys(cache).length, 2, "expected 2 position subs in the cache");
    t.is(subs1[0], "A.AAPL");
    t.is(subs1[1], "A.AMT");

    const subs2 = refreshSecondAggregateSubscribers([{ symbol: "AMT" }, { symbol: "BABA" }]);
    cache = getCacheItems();

    t.is(Object.keys(cache).length, 2, "expected 2 position subs in the cache");
    t.is(subs2[0], "A.AMT");
    t.is(subs2[1], "A.BABA");
});
