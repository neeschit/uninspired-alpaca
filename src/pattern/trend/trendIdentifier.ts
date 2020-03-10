import { getAverageDirectionalIndex } from "../../indicator/adx";
import { Bar } from "../../data/data.model";
import { LOGGER } from "../../instrumentation/log";

export enum TrendType {
    up = "up",
    down = "down",
    sideways = "sideways"
}

const getMaxMin = (bars: Bar[]) => {
    return bars.reduce(
        (previousValue, currentValue) => {
            let { max: prevMax, min: prevMin } = previousValue;
            if (currentValue.h > prevMax) {
                prevMax = currentValue.h;
            }

            if (currentValue.l < prevMin) {
                prevMin = currentValue.l;
            }

            return {
                max: prevMax,
                min: prevMin
            };
        },
        {
            min: Number.MAX_SAFE_INTEGER,
            max: Number.MIN_SAFE_INTEGER
        }
    );
};

export const getRecentTrend = (bars: Bar[]) => {
    if (!bars || !bars.length || bars.length < 2) {
        throw new Error();
    }

    const firstBarTrend = bars[1].c - bars[0].c > 0 ? TrendType.up : TrendType.down;
    const noChange = bars[1].c - bars[0].c === 0;

    const { closingTrend, highsTrend, lowsTrend } = bars.reduce(
        ({ closingTrend, highsTrend, lowsTrend }, bar, index) => {
            let newClosingTrend = closingTrend;
            let newHighsTrend = highsTrend;
            let newLowsTrend = lowsTrend;
            if (index) {
                newClosingTrend = bar.c - bars[index - 1].c > 0 ? TrendType.up : TrendType.down;
                newHighsTrend = bar.h - bars[index - 1].h > 0 ? TrendType.up : TrendType.down;
                newLowsTrend = bar.l - bars[index - 1].l > 0 ? TrendType.up : TrendType.down;
            }
            return {
                closingTrend: newClosingTrend,
                highsTrend: newHighsTrend,
                lowsTrend: newLowsTrend
            };
        },
        {
            closingTrend: firstBarTrend,
            highsTrend: firstBarTrend,
            lowsTrend: firstBarTrend
        }
    );

    return closingTrend;
};

export const getOverallTrend = (bars: Bar[]) => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(bars);

    const lastBarAdx = adx[adx.length - 1];

    if (lastBarAdx.value < 20) {
        return TrendType.sideways;
    }

    LOGGER.debug(pdx[pdx.length - 1]);
    LOGGER.debug(ndx[ndx.length - 1]);

    return pdx[pdx.length - 1] > ndx[ndx.length - 1] ? TrendType.up : TrendType.down;
};
