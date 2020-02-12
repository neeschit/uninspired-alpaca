import { getExponentialAverage } from "./average";
import { Bar } from "../connection/bar";

export const getTrueRange = (bars: Bar[]) => {
    if (!bars || !bars.length || bars.length < 2) {
        throw new Error("check_yo_shiz");
    }

    const currentDiff = bars[1].h - bars[1].l;
    const highDiff = Math.abs(bars[1].h - bars[0].c);
    const lowDiff = Math.abs(bars[1].l - bars[0].c);

    return Math.max(currentDiff, highDiff, lowDiff);
};

export const getAverageTrueRange = (bars: Bar[], period = 14) => {
    const tr = [];

    for (let index = 0; index < bars.length - 1; index++) {
        tr.push(getTrueRange(bars.slice(index, index + 2)));
    }

    const atr = getExponentialAverage(tr, period).map((value, index, array) => {
        return {
            value,
            t: bars[bars.length - array.length + index].t
        };
    });

    return { atr, tr, bars };
};
