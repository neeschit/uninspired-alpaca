import { TrendType } from "../pattern/trend/trendIdentifier";
import { Bar } from "../data/data.model";

const getTrend = (
    trend: Bar[],
    trendType = TrendType.up,
    start = 100,
    percentageIncrease = 10,
    step = 0
) => {
    trend = JSON.parse(JSON.stringify(trend));
    const maxIncrement = start / percentageIncrease;

    if (!step) {
        step = maxIncrement / trend.length;
        if (trendType === TrendType.down && step > 0) {
            step = -step;
        }
    }

    let iterationStep = step;

    const closingPrices = trend.map((bar, index) => {
        iterationStep = trendType === TrendType.sideways ? -iterationStep : iterationStep;
        return start + index * iterationStep + iterationStep;
    });

    const highPriceStart = start + step;
    iterationStep = step;

    const highPrices = trend.map((bar, index) => {
        iterationStep = trendType === TrendType.sideways ? -iterationStep : iterationStep;
        return highPriceStart + index * step + step;
    });

    const lowPriceStart = start - step;
    iterationStep = step;

    const lowPrices = trend.map((bar, index) => {
        iterationStep = trendType === TrendType.sideways ? -iterationStep : iterationStep;
        return lowPriceStart + index * step + step;
    });

    if (
        lowPrices.length < highPrices.length ||
        highPrices.length < closingPrices.length ||
        highPrices.length < trend.length
    ) {
        throw new Error("shiz wrong");
    }

    return trend.map((bar, index) => {
        bar.c = closingPrices[index];
        bar.o = closingPrices[index];
        bar.l = lowPrices[index];
        bar.h = highPrices[index];
        return bar;
    });
};

export default getTrend;
