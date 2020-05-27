import { TrendType, getTrend, getHeuristicTrend } from "../pattern/trend/trendIdentifier";
import { TRADING_RISK_UNIT_CONSTANT, assessRisk, getActualStop } from "../services/riskManagement";
import { isMarketOpen } from "../util/market";
import {
    TimestampType,
    Bar,
    TradeDirection,
    TradeType,
    TimeInForce,
    PlannedTradeConfig,
    PositionDirection,
    TradePlan,
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";
import { Broker } from "@neeschit/alpaca-trade-api";
import { alpaca } from "../resources/alpaca";
import { getAverageTrueRange, getTrueRange } from "../indicator/trueRange";
import { isSameDay } from "date-fns";
import { roundHalf } from "../util";
import { validatePositionEntryPlan } from "../services/tradeManagement";
import { getDirectionalMovementIndex } from "../indicator/dmi";
import { IndicatorValue } from "../indicator/adx";

export interface ORBParams {
    currentIntradayAtr: number;
    recentBars: Bar[];
    entryBar: Bar;
    atr: number;
    closePrice: number;
    symbol: string;
}

export const refreshOpeningRangeBreakoutPlan = (
    symbol: string,
    todaysBars: Bar[],
    dailyAtr: number,
    closePrice: number
) => {
    const { atr: currentIntradayAtrs } = getAverageTrueRange(todaysBars, false, 5);

    const currentIntradayAtrObject = currentIntradayAtrs[currentIntradayAtrs.length - 1];
    const currentIntradayAtr = currentIntradayAtrObject.value;
    const entryBar = todaysBars[0];

    return getOpeningRangeBreakoutPlan({
        recentBars: todaysBars,
        symbol: symbol,
        entryBar,
        closePrice,
        atr: dailyAtr,
        currentIntradayAtr,
    });
};

export const getOrbDirection = (bars: Bar[]): TradeDirection | null => {
    const firstBar = bars[0];
    const close = bars[bars.length - 1].c;
    const distanceFromLongEntry = Math.abs(close - firstBar.h);
    const distanceFromShortEntry = Math.abs(close - firstBar.l);

    if (distanceFromLongEntry < distanceFromShortEntry && close < firstBar.h) {
        return TradeDirection.buy;
    } else if (distanceFromShortEntry < distanceFromLongEntry && close > firstBar.l) {
        return TradeDirection.sell;
    }

    return null;
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

export const getOpeningRangeBreakoutPlan = ({
    currentIntradayAtr,
    recentBars,
    entryBar,
    atr,
    closePrice,
    symbol,
}: ORBParams) => {
    const lastBar = recentBars[recentBars.length - 1];

    const tradeDirection = getOrbDirection(recentBars);

    if (!tradeDirection) {
        return null;
    }

    const stopUnits = assessRisk(atr, currentIntradayAtr, closePrice);

    const { entryLong, entryShort } = getOrbEntryPrices(entryBar, currentIntradayAtr);

    if (lastBar.c > entryLong && tradeDirection === TradeDirection.buy) {
        return null;
    }

    if (lastBar.c < entryShort && tradeDirection === TradeDirection.sell) {
        return null;
    }

    const entryPrice = tradeDirection === TradeDirection.buy ? entryLong : entryShort;

    const stop = getActualStop(
        entryPrice,
        currentIntradayAtr,
        tradeDirection === TradeDirection.sell,
        atr
    );
    const unitRisk = stopUnits;

    const quantity = Math.ceil(TRADING_RISK_UNIT_CONSTANT / stopUnits);

    if (!quantity || quantity < 0) {
        LOGGER.error(`Expected an order for ${symbol} at ${lastBar.t}`);
        return null;
    }

    const riskAtrRatio = currentIntradayAtr / unitRisk;

    const allowedSlippage = Number((currentIntradayAtr / 10).toFixed(2));

    if (tradeDirection === TradeDirection.buy) {
        const plan = {
            plannedEntryPrice: entryLong,
            plannedStopPrice: stop,
            riskAtrRatio,
            quantity,
            side: PositionDirection.long,
            symbol: symbol,
        };

        return {
            plan,
            config: {
                symbol: symbol,
                quantity,
                side: TradeDirection.buy,
                type: TradeType.stop_limit,
                tif: TimeInForce.day,
                stopPrice: entryLong,
                price: entryLong + allowedSlippage,
                t: lastBar.t,
            },
        };
    } else if (tradeDirection === TradeDirection.sell) {
        const plan = {
            plannedEntryPrice: entryShort,
            plannedStopPrice: stop,
            riskAtrRatio,
            quantity,
            side: PositionDirection.short,
            symbol: symbol,
        };

        return {
            plan,
            config: {
                symbol: symbol,
                quantity,
                side: TradeDirection.sell,
                type: TradeType.stop_limit,
                tif: TimeInForce.day,
                stopPrice: entryShort,
                price: entryShort - allowedSlippage,
                t: lastBar.t,
            },
        };
    }

    return null;
};

export class NarrowRangeBarStrategy {
    symbol: string;
    broker: Broker;
    atr: number;
    tr: IndicatorValue<number>[];
    nrbTimestamps: number[] = [];
    nrbs: Bar[] = [];
    lastScreenedTimestamp = 0;
    lastEntryAttemptedTimestamp = 0;
    closePrice = 0;
    closeBar: Bar;
    bars: Bar[];

    di: {
        pdx: number;
        ndx: number;
    } = {
        ndx: 0,
        pdx: 0,
    };

    constructor({
        symbol,
        broker = alpaca,
        bars,
    }: {
        symbol: string;
        broker?: Broker;
        bars: Bar[];
    }) {
        this.symbol = symbol;
        this.broker = broker;

        const { atr, tr } = getAverageTrueRange(bars, false);

        this.closeBar = bars[bars.length - 1];

        this.closePrice = this.closeBar.c;

        this.atr = atr[atr.length - 1].value;
        this.tr = tr;
        this.bars = bars;
    }

    screenForNarrowRangeBars(bars: Bar[], currentEpoch = Date.now()) {
        if (this.nrbs.length) {
            return true;
        }
        const isYdayNrb = this.isNarrowRangeBar(
            this.tr.map((r) => r.value),
            this.bars,
            this.tr[this.tr.length - 1]
        );

        if (isYdayNrb) {
            this.nrbs.push(this.closeBar);
            this.nrbTimestamps.push(this.closeBar.t);
        }
    }

    isNarrowRangeBar(
        tr: number[],
        bars: Bar[],
        range: {
            value: number;
            t: number;
        }
    ) {
        const last7Ranges = tr.slice(-7);
        const { max } = this.getMinMaxPeriodRange(last7Ranges);

        const { min: threePeriodMin } = this.getMinMaxPeriodRange(last7Ranges.slice(-3));
        const { min: sevenPeriodMin } = this.getMinMaxPeriodRange(last7Ranges);

        const isNarrowRangeBar = range.value <= sevenPeriodMin * 1.02;

        return isNarrowRangeBar || this.isVeryNarrowRangeBar(max, threePeriodMin, range.value);
    }

    isVeryNarrowRangeBar(max: number, min: number, range: number) {
        LOGGER.trace(max / min);

        return range <= min * 1.02 && max / min > 3;
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

    isTimeForEntry(now: TimestampType) {
        const timeStart = convertToLocalTime(now, " 09:34:45.000");
        const timeEnd = convertToLocalTime(now, " 11:55:45.000");

        const nowMillis = now instanceof Date ? now.getTime() : now;

        const isWithinEntryRange =
            timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

        if (!isWithinEntryRange) {
            LOGGER.trace("come back later hooomie", nowMillis);
        }

        return isWithinEntryRange;
    }

    async onTradeUpdate(recentBars: Bar[], now: TimestampType = Date.now()) {
        return this.rebalance(recentBars, now);
    }

    async rebalance(
        recentBars: Bar[],
        now: TimestampType = Date.now(),
        currentPositions?: { symbol: string }[]
    ): Promise<PlannedTradeConfig | null> {
        if (!this.isTimeForEntry(now) || !recentBars.length || !this.nrbs.length) {
            LOGGER.trace(`not the time to enter for ${this.symbol} at ${new Date(now)}`);
            return null;
        }
        now = now instanceof Date ? now.getTime() : now;

        if (!currentPositions) {
            currentPositions = await this.broker.getPositions();
        }

        const isCurrentPosition =
            currentPositions.findIndex((p) => p.symbol === this.symbol) !== -1;

        if (isCurrentPosition) {
            return null;
        }

        const firstBar = recentBars[0];

        const { atr } = getAverageTrueRange(recentBars, true);

        try {
            const currentIntradayAtr = atr[atr.length - 1].value;
            const plan = getOpeningRangeBreakoutPlan({
                currentIntradayAtr,
                symbol: this.symbol,
                atr: this.atr,
                recentBars,
                entryBar: firstBar,
                closePrice: this.closePrice,
            });

            if (plan) {
                const isInvalid = validatePositionEntryPlan(
                    recentBars,
                    plan.config.side,
                    this.closePrice
                );

                if (!isInvalid) {
                    return plan;
                }
            }
        } catch (e) {
            LOGGER.error(e);
            return null;
        }

        return null;
    }

    resetEntryNrbs() {
        this.nrbs = [];
        this.nrbTimestamps = [];
    }
}
