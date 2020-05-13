import test from "ava";

import { fiveMinuteDataCache, getBarsForSymbol, handleAggregateDataPosted } from "./data.handlers";

test("ensure correct bars are cached and refreshed on new data posted", async (t) => {
    t.is(Object.keys(fiveMinuteDataCache).length, 0);

    const bars = await getBarsForSymbol("SPY", 1588944840000);

    t.is(bars.length, 10);

    await handleAggregateDataPosted(
        {
            v: 386134,
            vw: 290.4994,
            c: 290.63,
            l: 290.34,
            h: 290.675,
            o: 290.59,
            t: 1588944840000,
        },
        "SPY"
    );

    t.truthy(fiveMinuteDataCache["SPY"].length > 10);
});
