import { PositionDirection } from "@neeschit/alpaca-trade-api";
import { Bar } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { convertToLocalTime } from "../core-utils/util/date";
import { IndicatorValue } from "../core-indicators/indicator/adx";
import { TradePlan } from "../trade-management-helpers/position";
import { getActualStop } from "../core-indicators/services/riskManagement";

export const RISK_PER_ORDER = 100;
export const PROFIT_RATIO = 2;

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
    high: number,
    low: number,
    atr: number
): { entryLong: number; entryShort: number } => {
    const noiseSmoother = atr / 20;
    return {
        entryLong: high + noiseSmoother,
        entryShort: low - noiseSmoother,
    };
};

export interface OrbEntryParams {
    lastPrice: number;
    openingBar: Bar;
    currentAtr: number;
    symbol: string;
    marketBarsSoFar: Bar[];
    dailyAtr: number;
}

export const getLongStop = (
    marketBarsSoFar: Bar[],
    spread: number,
    proposedTradeStop: number
) => {
    return marketBarsSoFar.slice(-6).reduce((stop, b) => {
        return b.l >= proposedTradeStop - spread && b.l < stop ? b.l : stop;
    }, proposedTradeStop);
};

export const getShortStop = (
    marketBarsSoFar: Bar[],
    spread: number,
    proposedTradeStop: number
) => {
    return marketBarsSoFar.slice(-6).reduce((stop, b) => {
        return b.h <= proposedTradeStop + spread && b.h > stop ? b.h : stop;
    }, proposedTradeStop);
};

export const getSafeOrbEntryPlan = ({
    lastPrice,
    openingBar,
    currentAtr,
    symbol,
    marketBarsSoFar,
    dailyAtr,
}: OrbEntryParams): TradePlan => {
    const isCurrentlyOutsideRange =
        lastPrice > openingBar.h || lastPrice < openingBar.l;

    const direction = getOrbDirection(openingBar, lastPrice);

    let plan: Omit<TradePlan, "quantity">;

    const spread = currentAtr / 5;

    const rangeHigh = Math.max(
        openingBar.h,
        marketBarsSoFar.reduce((prev, bar) => {
            return bar.h > prev && bar.h <= prev + spread ? bar.h : prev;
        }, openingBar.h)
    );

    const rangeLow = Math.min(
        openingBar.l,
        marketBarsSoFar.reduce((prev, bar) => {
            return bar.l < prev && bar.l >= prev - spread ? bar.l : prev;
        }, openingBar.l)
    );

    const { entryLong, entryShort } = getOrbEntryPrices(
        rangeHigh,
        rangeLow,
        currentAtr
    );

    if (direction === PositionDirection.long) {
        const entry = entryLong;

        const stop = getActualStop(entry, currentAtr, false, dailyAtr);

        const limit = entry + currentAtr / 12;

        const target = entry + (entry - stop) * PROFIT_RATIO;

        plan = {
            entry,
            limit_price: limit,
            stop,
            target,
            symbol,
            side: direction,
        };
    } else {
        const entry = entryShort;
        const stop = getActualStop(entry, currentAtr, true, dailyAtr);
        const limit = entry - currentAtr / 12;
        const target = entry + (entry - stop) * PROFIT_RATIO;

        plan = {
            entry,
            limit_price: limit,
            target,
            stop,
            symbol,
            side: direction,
        };
    }

    if (isCurrentlyOutsideRange) {
        plan.entry = plan.limit_price;
    }

    const quantity = getQuantityForPlan(RISK_PER_ORDER, plan);

    return Object.assign(
        {
            quantity,
        },
        plan
    );
};

export const getQuantityForPlan = (
    riskUnits: number,
    plan: Omit<TradePlan, "quantity">
) => {
    return Math.floor(riskUnits / (plan.limit_price - plan.stop));
};

export class NarrowRangeBarStrategy {
    symbol: string;
    tr: IndicatorValue<number>[];
    closeBar: Bar;
    bars: Bar[];
    nrb: boolean = false;

    constructor({
        symbol,
        bars,
        tr,
    }: {
        symbol: string;
        bars: Bar[];
        tr: IndicatorValue<number>[];
    }) {
        this.symbol = symbol;

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
