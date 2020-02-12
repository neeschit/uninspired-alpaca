import test from "ava";
import uptrend from "../fixtures/uptrend";
import downtrend from "../fixtures/downtrend";
import { getAverageDirectionalIndex } from "./adx";

test("getAdx - uptrend", t => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(uptrend);

    t.is(adx[adx.length - 1].value, 42.45438184588078);
});

test("getAdx - downtrend", t => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(downtrend);

    t.is(adx[adx.length - 1].value, 33.29778261226684);
});
