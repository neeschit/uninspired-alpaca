import { getAverageDirectionalIndex } from "../../indicator/adx";
import { Bar } from "../../data/data.model";
import { LOGGER } from "../../instrumentation/log";
import { getDirectionalMovementIndex } from "../../indicator/dmi";
import { getAverageTrueRange } from "../../indicator/trueRange";

export enum TrendType {
    up = "up",
    down = "down",
    sideways = "sideways",
    unknown = "unknown",
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

export enum TrendPhase {
    initial,
    big_move,
    fizzle,
}

export interface TrendInformation {
    value: TrendType;
    trendBreakThreshold: number;
    peaks: number[];
    troughs: number[];
}

export interface Trend {
    primary: TrendInformation;
    secondary: TrendInformation[];
}

const defaultNoTrend: Trend = {
    primary: {
        value: TrendType.sideways,
        trendBreakThreshold: 0,
        peaks: [],
        troughs: [],
    },
    secondary: [
        {
            value: TrendType.sideways,
            trendBreakThreshold: 0,
            peaks: [],
            troughs: [],
        },
    ],
};

export const getHeuristicTrend = (ydayClosingBar: Bar, todaysBars: Bar[]): Trend => {
    if (!todaysBars || !todaysBars.length) {
        return defaultNoTrend;
    }

    const closePrice = ydayClosingBar.c;
    const firstBarToday = todaysBars[0];

    const initialGap = firstBarToday.o - closePrice;

    let trendDirection: TrendType;

    if (initialGap > 0) {
        trendDirection = TrendType.up;
    } else {
        trendDirection = TrendType.down;
    }
    let initialPrimaryTrend: TrendInformation = getNewTrendObject(
        closePrice,
        firstBarToday,
        trendDirection
    );

    let initialTrend: Trend = {
        primary: initialPrimaryTrend,
        secondary: [
            getNewTrendObject(
                initialPrimaryTrend.value === TrendType.up ? firstBarToday.l : firstBarToday.h,
                firstBarToday,
                initialPrimaryTrend.value
            ),
        ],
    };

    const trend: Trend = todaysBars.reduce((newTrend, bar, index) => {
        if (!index) {
            return newTrend;
        }

        const barsSoFar = todaysBars.slice(0, index + 1);

        const { atr } = getAverageTrueRange(barsSoFar, false);

        const noiseSmoother = atr[atr.length - 1].value / 4;

        const {
            hasTrendChanged: newPrimaryTrendStarted,
            currentTroughDiff: primaryCurrentTroughDiff,
            currentPeakDiff: primaryCurrentPeakDiff,
        } = hasTrendChanged(newTrend.primary, bar, noiseSmoother);

        if (newPrimaryTrendStarted) {
            const newInitialPrimaryTrend = getNewTrendObject(
                bar.c,
                bar,
                newTrend.primary.value === TrendType.down ? TrendType.up : TrendType.down
            );

            let newInitialTrend: Trend = {
                primary: newInitialPrimaryTrend,
                secondary: [{ ...newInitialPrimaryTrend, trendBreakThreshold: bar.c }],
            };

            return newInitialTrend;
        } else {
            const currentTrough = newTrend.primary.troughs[newTrend.primary.troughs.length - 1];
            const currentPeak = newTrend.primary.peaks[newTrend.primary.peaks.length - 1];

            if (
                currentTrough &&
                bar.l < currentTrough &&
                newTrend.primary.value === TrendType.down &&
                primaryCurrentTroughDiff > noiseSmoother
            ) {
                newTrend.primary.troughs.push(bar.l);
            }

            if (
                currentPeak &&
                bar.h > currentPeak &&
                newTrend.primary.value === TrendType.up &&
                primaryCurrentPeakDiff > noiseSmoother
            ) {
                newTrend.primary.peaks.push(bar.h);
            }

            if (
                newTrend.primary.value === TrendType.down &&
                bar.c > bar.o &&
                (!primaryCurrentPeakDiff || Math.abs(primaryCurrentPeakDiff) > noiseSmoother)
            ) {
                newTrend.primary.peaks.push(bar.h);
            }

            if (
                newTrend.primary.value === TrendType.up &&
                bar.c < bar.o &&
                (!primaryCurrentTroughDiff || Math.abs(primaryCurrentTroughDiff) > noiseSmoother)
            ) {
                newTrend.primary.troughs.push(bar.l);
            }
        }

        const currentSecondaryTrend = newTrend.secondary[newTrend.secondary.length - 1];

        const {
            hasSecondaryTrendChanged,
            troughedSignificantly,
            peakedSignificantly,
            currentPeakDiff,
            currentTroughDiff,
        } = checkIfSecondaryTrendChanged(currentSecondaryTrend, noiseSmoother, barsSoFar);

        const currentTrough =
            currentSecondaryTrend.troughs[currentSecondaryTrend.troughs.length - 1];
        const currentPeak = currentSecondaryTrend.peaks[currentSecondaryTrend.peaks.length - 1];
        if (
            currentSecondaryTrend.value === TrendType.down &&
            currentTrough &&
            bar.l < currentTrough &&
            troughedSignificantly
        ) {
            currentSecondaryTrend.troughs.push(bar.l);
        }

        if (
            currentSecondaryTrend.value === TrendType.up &&
            currentPeak &&
            bar.h > currentPeak &&
            peakedSignificantly
        ) {
            currentSecondaryTrend.peaks.push(bar.h);
        }

        if (
            currentSecondaryTrend.value === TrendType.down &&
            bar.c > bar.o &&
            (!currentPeakDiff || Math.abs(currentPeakDiff) > noiseSmoother)
        ) {
            currentSecondaryTrend.peaks.push(bar.h);
        }

        if (
            currentSecondaryTrend.value === TrendType.up &&
            bar.c < bar.o &&
            (!currentTroughDiff || Math.abs(currentTroughDiff) > noiseSmoother)
        ) {
            currentSecondaryTrend.troughs.push(bar.l);
        }

        if (hasSecondaryTrendChanged) {
            const newSecondaryTrend = getNewTrendObject(
                bar.c,
                bar,
                currentSecondaryTrend.value === TrendType.down ? TrendType.up : TrendType.down
            );

            newSecondaryTrend.troughs = [currentSecondaryTrend.trendBreakThreshold];

            newTrend.secondary.push(newSecondaryTrend);
        }

        return newTrend;
    }, initialTrend);

    return trend;
};

const getNewTrendObject = (closePrice: number, bar: Bar, trend: TrendType): TrendInformation => {
    return trend === TrendType.up
        ? {
              trendBreakThreshold: closePrice,
              peaks: [bar.h],
              troughs: [closePrice],
              value: trend,
          }
        : {
              trendBreakThreshold: closePrice,
              peaks: [closePrice],
              troughs: [bar.l],
              value: trend,
          };
};

const checkIfSecondaryTrendChanged = (
    currentSecondaryTrend: TrendInformation,
    noiseSmoother: number,
    bars: Bar[]
) => {
    const {
        hasTrendChanged: hasSecondaryTrendChanged,
        currentPeakDiff,
        currentTroughDiff,
        peakedSignificantly,
        troughedSignificantly,
    } = hasTrendChanged(currentSecondaryTrend, bars[bars.length - 1], noiseSmoother);

    return {
        peakedSignificantly,
        troughedSignificantly,
        hasSecondaryTrendChanged,
        currentPeakDiff,
        currentTroughDiff,
    };
};

const hasTrendChanged = (trend: TrendInformation, bar: Bar, noiseSmoother: number) => {
    const currentPeak = trend.peaks[trend.peaks.length - 1];
    const currentTrough = trend.troughs[trend.troughs.length - 1];

    const currentPeakDiff = bar.h - currentPeak;
    const currentTroughDiff = currentTrough - bar.l;
    const peakedSignificantly = currentPeakDiff > noiseSmoother;
    const troughedSignificantly = currentTroughDiff > noiseSmoother;

    let hasTrendChanged = false;

    if (trend.value === TrendType.up) {
        const normalizedTrendBreakThreshold = trend.trendBreakThreshold - noiseSmoother;
        hasTrendChanged = bar.c < normalizedTrendBreakThreshold;
    } else if (trend.value === TrendType.down) {
        const normalizedTrendBreakThreshold = trend.trendBreakThreshold + noiseSmoother;
        hasTrendChanged = bar.c > normalizedTrendBreakThreshold;
    }

    return {
        hasTrendChanged,
        peakedSignificantly,
        currentPeakDiff,
        troughedSignificantly,
        currentTroughDiff,
    };
};
