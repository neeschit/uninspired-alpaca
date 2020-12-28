import { getVolumeProfile, getNextResistance } from "./volumeProfile";
import { readJsonSync } from "fs-extra";

const trend = readJsonSync("../fixtures/volumeProfile.json");
const bars = readJsonSync("../fixtures/narrowRange.json");

test("volume profile", (t) => {
    const volumeProfile = getVolumeProfile(trend);
    expect(volumeProfile[0]).toEqual({ v: 175135776, low: 317, high: 318 });
});

test("find resistance", (t) => {
    const nextResistance = getNextResistance(trend, false, 310);

    expect(nextResistance[0]).toEqual(317);
});

test("find resistance - tal bars2", (t) => {
    const nextResistance = getNextResistance(bars, false, 50);
    expect(nextResistance[0]).toEqual(51);
});
