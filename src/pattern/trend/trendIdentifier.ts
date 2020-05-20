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
    phase: TrendPhase;
    details: {
        peak: {
            previous: number;
            current: number;
        };
        trough: {
            previous: number;
            current: number;
        };
    };
}

export interface Trend {
    primary: TrendInformation;
    secondary: TrendInformation[];
}

const defaultNoTrend: Trend = {
    primary: {
        value: TrendType.sideways,
        phase: TrendPhase.initial,
        trendBreakThreshold: 0,
        details: {
            peak: {
                previous: 0,
                current: 0,
            },
            trough: {
                previous: 0,
                current: 0,
            },
        },
    },
    secondary: [
        {
            value: TrendType.sideways,
            phase: TrendPhase.initial,
            trendBreakThreshold: 0,
            details: {
                peak: {
                    previous: 0,
                    current: 0,
                },
                trough: {
                    previous: 0,
                    current: 0,
                },
            },
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
            if (bar.l < newTrend.primary.details.trough.current) {
                if (primaryCurrentTroughDiff > noiseSmoother)
                    newTrend.primary.details.trough.previous =
                        newTrend.primary.details.trough.current;
                newTrend.primary.details.trough.current = bar.l;
            }

            if (bar.h > newTrend.primary.details.peak.current) {
                if (primaryCurrentPeakDiff > noiseSmoother)
                    newTrend.primary.details.peak.previous = newTrend.primary.details.peak.current;
                newTrend.primary.details.peak.current = bar.h;
            }
        }

        const currentSecondaryTrend = newTrend.secondary[newTrend.secondary.length - 1];

        const {
            hasSecondaryTrendChanged,
            troughedSignificantly,
            peakedSignificantly,
        } = checkIfSecondaryTrendChanged(currentSecondaryTrend, noiseSmoother, barsSoFar);

        if (!hasSecondaryTrendChanged) {
            if (troughedSignificantly) {
                currentSecondaryTrend.details.trough.previous =
                    currentSecondaryTrend.details.trough.current;
                currentSecondaryTrend.details.trough.current = bar.l;
            } else if (bar.l < currentSecondaryTrend.details.trough.current) {
                if (!currentSecondaryTrend.details.trough.previous) {
                    currentSecondaryTrend.details.trough.previous =
                        currentSecondaryTrend.details.trough.current;
                }
                currentSecondaryTrend.details.trough.current = bar.l;
            }
            if (peakedSignificantly) {
                currentSecondaryTrend.details.peak.previous =
                    currentSecondaryTrend.details.peak.current;
                currentSecondaryTrend.details.peak.current = bar.h;
            } else if (bar.h > currentSecondaryTrend.details.peak.current) {
                if (!currentSecondaryTrend.details.peak.previous) {
                    currentSecondaryTrend.details.peak.previous =
                        currentSecondaryTrend.details.peak.current;
                }
                currentSecondaryTrend.details.peak.current = bar.h;
            }
        } else {
            const newSecondaryTrend = getNewTrendObject(
                bar.c,
                bar,
                currentSecondaryTrend.value === TrendType.down ? TrendType.up : TrendType.down
            );

            newTrend.secondary.push(newSecondaryTrend);
        }

        return newTrend;
    }, initialTrend);

    return trend;
};

const getNewTrendObject = (closePrice: number, bar: Bar, trend: TrendType): TrendInformation => {
    return trend === TrendType.up
        ? {
              phase: TrendPhase.initial,
              trendBreakThreshold: bar.l,
              details: {
                  peak: {
                      current: bar.h,
                      previous: 0,
                  },
                  trough: {
                      current: bar.l,
                      previous: 0,
                  },
              },
              value: trend,
          }
        : {
              phase: TrendPhase.initial,
              trendBreakThreshold: closePrice,
              details: {
                  peak: {
                      current: closePrice,
                      previous: 0,
                  },
                  trough: {
                      current: bar.l,
                      previous: 0,
                  },
              },
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
    const currentPeakDiff = bar.h - trend.details.peak.current;
    const currentTroughDiff = trend.details.trough.current - bar.l;
    const peakedSignificantly = Math.abs(currentPeakDiff) > noiseSmoother;
    const troughedSignificantly = Math.abs(currentTroughDiff) > noiseSmoother;

    let hasTrendChanged = false;

    if (trend.value === TrendType.up) {
        const normalizedTrendBreakThreshold = trend.trendBreakThreshold - noiseSmoother;
        hasTrendChanged =
            bar.c < normalizedTrendBreakThreshold &&
            trend.details.trough.previous <= trend.trendBreakThreshold;
    } else if (trend.value === TrendType.down) {
        const normalizedTrendBreakThreshold = trend.trendBreakThreshold + noiseSmoother;
        hasTrendChanged =
            bar.c > normalizedTrendBreakThreshold &&
            trend.details.peak.previous >= trend.trendBreakThreshold;
    }

    return {
        hasTrendChanged,
        peakedSignificantly,
        currentPeakDiff,
        troughedSignificantly,
        currentTroughDiff,
    };
};
