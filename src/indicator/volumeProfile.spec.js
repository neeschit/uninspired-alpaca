const { getVolumeProfile, getNextResistance } = require("./volumeProfile.js");
const test = require("ava");
const trend = require("../fixtures/volumeProfile.js");
const { bars2 } = require("../fixtures/narrowRange.js");

test("volume profile", t => {
    const volumeProfile = getVolumeProfile(trend);
    t.deepEqual(volumeProfile[0], { v: 175135776, low: 317, high: 318 });
});

test("find resistance", t => {
    const nextResistance = getNextResistance(trend, false, 310);
    console.log(nextResistance);

    t.is(nextResistance[0], 317);
});

test("find resistance - tal bars2", t => {
    const nextResistance = getNextResistance(bars2, false, 50);
    console.log(nextResistance);
    t.is(nextResistance[0], 51);
});
