import { readJSONSync } from "fs-extra";
import { getAverageDirectionalIndex } from "./adx";

const downtrend = readJSONSync("./fixtures/downtrend.json") as any;
const uptrend = readJSONSync("./fixtures/uptrend.json") as any;

test("getAdx - uptrend", () => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(uptrend);

    expect(adx[adx.length - 1].value).toEqual(42.45438184588078);
});

test("getAdx - downtrend", () => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(downtrend);

    expect(adx[adx.length - 1].value).toEqual(33.29778261226684);
});
