const { getVolumeProfile } = require("./volumeProfile.js");
const test = require("ava");
const trend = require("../fixtures/volumeProfile.js");

test("volume profile", t => {
    const maxVolumeBar = getVolumeProfile(trend);
    t.is(maxVolumeBar, maxVolumeBar);
});
