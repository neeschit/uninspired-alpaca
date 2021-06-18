import { SimpleBar } from "@neeschit/common-interfaces";

export const reduceToSingleBar = (bars: SimpleBar[]) => {
    const { high, low, volume } = bars.reduce(
        ({ high, low, volume }, bar) => {
            return {
                high: bar.h > high ? bar.h : high,
                low: bar.l < low ? bar.l : low,
                volume: volume + bar.v,
            };
        },
        {
            high: bars[0].h,
            low: bars[0].l,
            volume: 0,
        }
    );

    const open = bars[0].o;
    const close = bars[bars.length - 1].c;

    return {
        o: open,
        c: close,
        h: high,
        l: low,
        v: volume,
        t: bars[0].t,
    };
};

export const groupMinuteBarsAndReduce = (
    minuteBars: SimpleBar[],
    timeperiod = 5
) => {
    return minuteBars
        .reduce((reducedBars: SimpleBar[][], bar, index) => {
            const mappedIndex = Math.floor(index / timeperiod);
            reducedBars[mappedIndex] = reducedBars[mappedIndex] || [];

            reducedBars[mappedIndex].push(bar);

            return reducedBars;
        }, [])
        .map((bars) => {
            return reduceToSingleBar(bars);
        });
};
