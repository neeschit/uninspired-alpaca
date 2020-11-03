import { TimestampType, Bar } from "../../src/data/data.model";
import { LOGGER } from "../../src/instrumentation/log";
import { convertToLocalTime } from "../../src/util/date";
import { PositionDirection, TradeDirection } from "@neeschit/alpaca-trade-api";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import { IndicatorValue } from "../../src/indicator/adx";

export interface ORBParams {
    currentIntradayAtr: number;
    recentBars: Bar[];
    entryBar: Bar;
    atr: number;
    closePrice: number;
    symbol: string;
    lastBar: Bar;
    shouldCancelIfAboveEntry: boolean;
}

export const isTimeForOrbEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:59:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 11:45:15.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    if (!isWithinEntryRange) {
        LOGGER.trace("come back later hooomie", nowMillis);
    }

    return isWithinEntryRange;
};

export const getOrbDirection = (
    openingBar: Bar,
    close: number
): PositionDirection => {
    const distanceFromLongEntry = Math.abs(close - openingBar.h);
    const distanceFromShortEntry = Math.abs(close - openingBar.l);

    if (distanceFromLongEntry < distanceFromShortEntry) {
        return PositionDirection.long;
    } else {
        return PositionDirection.short;
    }
};

export const getOrbEntryPrices = (
    bar: Bar,
    atr: number
): { entryLong: number; entryShort: number } => {
    const noiseSmoother = atr / 12;
    return {
        entryLong: bar.h + noiseSmoother,
        entryShort: bar.l - noiseSmoother,
    };
};

export interface OrbEntryParams {
    lastPrice: number;
    openingBar: Bar;
    currentAtr: number;
    symbol: string;
    marketBarsSoFar: Bar[];
}

export interface TradePlan {
    stop: number;
    limit: number;
    entry: number;
    direction: PositionDirection;
    symbol: string;
}

export const getLongStop = (
    marketBarsSoFar: Bar[],
    spread: number,
    proposedTradeStop: number
) => {
    return marketBarsSoFar.slice(-6).reduce((stop, b) => {
        return b.l >= stop - spread && b.l < stop ? b.l : stop;
    }, proposedTradeStop);
};

export const getShortStop = (
    marketBarsSoFar: Bar[],
    spread: number,
    proposedTradeStop: number
) => {
    return marketBarsSoFar.slice(-6).reduce((stop, b) => {
        return b.h <= stop + spread && b.h > stop ? b.h : stop;
    }, proposedTradeStop);
};

export const getSafeOrbEntryPlan = ({
    lastPrice,
    openingBar,
    currentAtr,
    symbol,
    marketBarsSoFar,
}: OrbEntryParams): TradePlan | null => {
    const isCurrentlyOutsideRange =
        lastPrice > openingBar.h || lastPrice < openingBar.l;

    const direction = getOrbDirection(openingBar, lastPrice);

    let plan: TradePlan;

    const spread = currentAtr / 5;

    const rangeHigh = Math.max(
        openingBar.h,
        marketBarsSoFar.reduce((prev, bar) => {
            return bar.h > prev && bar.h <= prev + spread ? bar.h : prev;
        }, marketBarsSoFar[0].h)
    );

    const rangeLow = Math.min(
        openingBar.l,
        marketBarsSoFar.reduce((prev, bar) => {
            return bar.l < prev && bar.l >= prev - spread ? bar.l : prev;
        }, marketBarsSoFar[0].l)
    );

    if (direction === PositionDirection.long) {
        const stopEntryLong = rangeHigh + currentAtr / 20;
        const proposedTradeStop = rangeHigh - currentAtr * 1.2;

        const tradeStop = getLongStop(
            marketBarsSoFar,
            spread,
            proposedTradeStop
        );

        plan = {
            entry: stopEntryLong,
            limit: stopEntryLong + currentAtr / 12,
            stop: tradeStop,
            symbol,
            direction,
        };
    } else {
        const stopEntryShort = rangeLow - currentAtr / 20;
        const proposedTradeStop = rangeLow + currentAtr * 1.2;

        const tradeStop = getShortStop(
            marketBarsSoFar,
            spread,
            proposedTradeStop
        );

        plan = {
            entry: stopEntryShort,
            limit: stopEntryShort - currentAtr / 12,
            stop: tradeStop,
            symbol,
            direction,
        };
    }

    if (isCurrentlyOutsideRange) {
        plan.entry = plan.limit;
    }

    return plan;
};

export class NarrowRangeBarStrategy {
    symbol: string;
    tr: IndicatorValue<number>[];
    closeBar: Bar;
    bars: Bar[];
    nrb: boolean = false;

    constructor({ symbol, bars }: { symbol: string; bars: Bar[] }) {
        this.symbol = symbol;

        const { tr } = getAverageTrueRange(bars, false);

        this.closeBar = bars[bars.length - 1];
        this.tr = tr;

        this.bars = bars;
    }

    screenForNarrowRangeBars() {
        if (this.nrb) {
            return true;
        }
        this.nrb = this.isNarrowRangeBar(
            this.tr.map((r) => r.value),
            this.tr[this.tr.length - 1]
        );

        return this.nrb;
    }

    isNarrowRangeBar(
        tr: number[],
        range: {
            value: number;
            t: number;
        }
    ) {
        const last7Ranges = tr.slice(-7);
        const { max } = this.getMinMaxPeriodRange(last7Ranges);

        const { min: sevenPeriodMin } = this.getMinMaxPeriodRange(last7Ranges);

        const isNarrowRangeBar = range.value <= sevenPeriodMin * 1.3;

        return (
            isNarrowRangeBar && this.isVeryNarrowRangeBar(max, sevenPeriodMin)
        );
    }

    isVeryNarrowRangeBar(max: number, min: number) {
        LOGGER.trace(max / min);

        return max / min > 3;
    }

    private getMinMaxPeriodRange(tr: number[]) {
        return tr.reduce(
            ({ min, max }: { min: number; max: number }, range: number) => {
                let newMin = min;
                let newMax = max;
                if (range < min) {
                    newMin = range;
                }

                if (range > max) {
                    newMax = range;
                }

                return {
                    min: newMin,
                    max: newMax,
                };
            },
            {
                min: Number.MAX_SAFE_INTEGER,
                max: 0,
            }
        );
    }
}
