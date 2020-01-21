const getTrueRange = bars => {
    if (!bars || !bars.length || !bars.length > 1) {
        throw new Error("check_yo_shiz");
    }

    const currentDiff = bars[1].h - bars[1].l;
    const highDiff = Math.abs(bars[1].h - bars[0].c);
    const lowDiff = Math.abs(bars[1].l - bars[0].c);

    return Math.max(currentDiff, highDiff, lowDiff);
};

module.exports = {
    getTrueRange
};
