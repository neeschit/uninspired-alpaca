const { getExponentialAverage } = require("./average.js");

const getTrueRange = bars => {
    if (!bars || !bars.length || !bars.length > 1) {
        throw new Error("check_yo_shiz");
    }

    const currentDiff = bars[1].h - bars[1].l;
    const highDiff = Math.abs(bars[1].h - bars[0].c);
    const lowDiff = Math.abs(bars[1].l - bars[0].c);

    return Math.max(currentDiff, highDiff, lowDiff);
};

const getAverageTrueRange = (bars, period = 14) => {
    const tr = [];

    for (let index = 0; index < bars.length - 1; index++) {
        tr.push(getTrueRange(bars.slice(index, index + 2)));
    }

    return [getExponentialAverage(tr, period), tr, bars];
};

module.exports = {
    getTrueRange,
    getAverageTrueRange
};
