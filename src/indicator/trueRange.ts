import { getExponentialAverage } from "./average";
import { Bar } from "../data/data.model";

export const getTrueRange = (bars: Bar[], useSimpleDefinition = true) => {
    if (!bars || !bars.length || bars.length < 2) {
        throw new Error("check_yo_shiz");
    }

    const currentDiff = bars[1].h - bars[1].l;

    if (useSimpleDefinition) {
        return currentDiff;
    }

    const highDiff = Math.abs(bars[1].h - bars[0].c);
    const lowDiff = Math.abs(bars[1].l - bars[0].c);

    return Math.max(currentDiff, highDiff, lowDiff);
};

export const getAverageTrueRange = (bars: Bar[], useSimpleRange = true, period = 14) => {
    const tr = [];

    for (let index = 0; index < bars.length - 1; index++) {
        tr.push({
            value: getTrueRange(bars.slice(index, index + 2), useSimpleRange),
            t: bars[index + 1].t,
        });
    }

    const atr = getExponentialAverage(
        tr.map((r) => r.value),
        period
    ).map((value, index, array) => {
        return {
            value,
            t: bars[bars.length - array.length + index].t,
        };
    });

    return { atr, tr, bars };
};
