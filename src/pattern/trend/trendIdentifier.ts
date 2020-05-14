import { getAverageDirectionalIndex } from "../../indicator/adx";
import { Bar } from "../../data/data.model";
import { LOGGER } from "../../instrumentation/log";
import { getDirectionalMovementIndex } from "../../indicator/dmi";

export enum TrendType {
    up = "up",
    down = "down",
    sideways = "sideways",
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
                min: prevMin,
            };
        },
        {
            min: Number.MAX_SAFE_INTEGER,
            max: Number.MIN_SAFE_INTEGER,
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
                lowsTrend: newLowsTrend,
            };
        },
        {
            closingTrend: firstBarTrend,
            highsTrend: firstBarTrend,
            lowsTrend: firstBarTrend,
        }
    );

    return closingTrend;
};

export const getOverallTrend = (bars: Bar[]) => {
    const { adx, pdx, ndx } = getAverageDirectionalIndex(bars, false);

    const lastBarAdx = adx[adx.length - 1];

    if (lastBarAdx.value < 20) {
        return TrendType.sideways;
    }

    LOGGER.debug(pdx[pdx.length - 1]);
    LOGGER.debug(ndx[ndx.length - 1]);

    return Math.abs(pdx[pdx.length - 1]) > Math.abs(ndx[ndx.length - 1])
        ? TrendType.up
        : TrendType.down;
};

export const getOverallTrendWithSuppliedAdx = ({
    adx,
    ndx,
    pdx,
}: {
    adx: {
        value: number;
        t: number;
    }[];
    pdx: number[];
    ndx: number[];
}) => {
    const lastBarAdx = adx[adx.length - 1];

    if (lastBarAdx.value < 20) {
        return TrendType.sideways;
    }

    LOGGER.trace(pdx[pdx.length - 1]);
    LOGGER.trace(ndx[ndx.length - 1]);

    return Math.abs(pdx[pdx.length - 1]) > Math.abs(ndx[ndx.length - 1])
        ? TrendType.up
        : TrendType.down;
};

export const getTrend = (recentBars: Bar[], closePrice: number) => {
    const lastBar = recentBars[recentBars.length - 1];

    /* const recentTrend = getRecentTrend(recentBars.slice(-3));

    if (recentTrend !== TrendType.sideways) {
        return recentTrend;
    } */

    return lastBar.c > closePrice ? TrendType.up : TrendType.down;
};
