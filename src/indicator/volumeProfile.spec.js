const { getVolumeProfile } = require("./volumeProfile.js");
const test = require("ava");
const trend = require("../fixtures/volumeProfile.js");

test("volume profile", t => {
    const volumeProfile = getVolumeProfile(trend);
    t.truthy(true);
});
