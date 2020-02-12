import { getVolumeProfile, getNextResistance } from "./volumeProfile";
import test from "ava";
import trend from "../fixtures/volumeProfile";
import { bars2 } from "../fixtures/narrowRange";

test("volume profile", t => {
    const volumeProfile = getVolumeProfile(trend);
    t.deepEqual(volumeProfile[0], { v: 175135776, low: 317, high: 318 });
});

test("find resistance", t => {
    const nextResistance = getNextResistance(trend, false, 310);

    t.is(nextResistance[0], 317);
});

test("find resistance - tal bars2", t => {
    const nextResistance = getNextResistance(bars2, false, 50);
    t.is(nextResistance[0], 51);
});
