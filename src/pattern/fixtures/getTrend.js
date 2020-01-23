const nj = require("numjs");
const { TrendType } = require("../trend/trendIdentifier.js");

const getTrend = (
    trend,
    trendType = TrendType.up,
    start = 100,
    percentageIncrease = 10,
    step = 0
) => {
    trend = JSON.parse(JSON.stringify(trend));
    const maxIncrement = start / percentageIncrease;

    if (!step) {
        step = maxIncrement / trend.length;
    }

    const closingPrices = nj.arange(start, start + maxIncrement, step);
    const highPriceStart = start + step;
    const highPrices = nj.arange(
        highPriceStart,
        highPriceStart + maxIncrement,
        step
    );
    const lowPriceStart = start - step;
    const lowPrices = nj.arange(
        lowPriceStart,
        lowPriceStart + maxIncrement,
        step
    );

    if (
        lowPrices.length < highPrices.length ||
        highPrices.length < closingPrices.length ||
        highPrices.length < trend.length
    ) {
        throw new Error("shiz wrong");
    }

    return trend.map((bar, index) => {
        const adjustedIndex =
            trendType === TrendType.up ? index : trend.length - index - 1;
        bar.c = closingPrices.get(adjustedIndex);
        bar.l = lowPrices.get(adjustedIndex);
        bar.h = highPrices.get(adjustedIndex);
        return bar;
    });
};

module.exports = getTrend;
