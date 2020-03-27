import { set, addDays } from "date-fns";
import { getAverageDirectionalIndex, IndicatorValue } from "../indicator/adx";
import { getOverallTrend, getRecentTrend, TrendType } from "../pattern/trend/trendIdentifier";
import { getVolumeProfile, getNextResistance, VolumeProfileBar } from "../indicator/volumeProfile";
import { assessRisk, TRADING_RISK_UNIT_CONSTANT } from "../services/riskManagement";
import { isMarketOpen } from "../util/market";
import { getBarsByDate } from "../data/bars";
import {
    TimestampType,
    Bar,
    MarketTimezone,
    TradeDirection,
    TradeType,
    TimeInForce,
    TradeConfig,
    PlannedTradeConfig,
    PositionDirection
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";
import { ceilHalf, floorHalf } from "../util";

export class NarrowRangeBarStrategy {
    period: number;
    symbol: string;
    bars: Bar[];
    adx: IndicatorValue<number>[];
    pdx: number[];
    ndx: number[];
    atr: IndicatorValue<number>[];
    tr: number[];

    volumeProfile: VolumeProfileBar[];

    overallTrend: TrendType;
    recentTrend: TrendType;
    counterTrend: boolean;

    constructor({
        period = 7,
        symbol,
        bars,
        useSimpleRange = false,
        counterTrend = false
    }: {
        period: number;
        symbol: string;
        bars: Bar[];
        useSimpleRange: boolean;
        counterTrend: boolean;
    }) {
        if (period < 4) {
            throw new Error("fix da shiz");
        }
        if (!bars) {
            throw new Error("need bars");
        }
        this.period = period;
        this.symbol = symbol;
        this.bars = bars;

        if (bars.length < 15) {
            throw new Error(`not a proper narrow range bar for symbol ${symbol}`);
        }

        const { adx, pdx, ndx, atr, tr } = getAverageDirectionalIndex(this.bars, useSimpleRange);
        this.adx = adx;
        this.pdx = pdx;
        this.ndx = ndx;

        this.atr = atr;
        this.tr = tr;
        this.volumeProfile = getVolumeProfile(this.bars);

        this.overallTrend = getOverallTrend(this.bars);
        this.recentTrend = getRecentTrend(this.bars.slice(-2));

        this.counterTrend = counterTrend;
    }

    get atrValue() {
        return this.atr[this.atr.length - 1].value;
    }

    get currentPrice() {
        return this.bars[this.bars.length - 1].c;
    }

    checkIfFitsStrategy(profitRatio = 2, strict = false) {
        const ranges = this.tr.slice(-this.period);
        const isNarrowRangeBar = strict
            ? this.isVeryNarrowRangeBar(ranges)
            : this.isNarrowRangeBar(ranges);
        return isNarrowRangeBar;
    }

    isNarrowRangeBar(tr: number[]) {
        const { min, max } = this.getMinMaxPeriodRange(tr);

        return tr[tr.length - 1] === min;
    }

    isVeryNarrowRangeBar(tr: number[]) {
        const { min, max } = this.getMinMaxPeriodRange(tr);

        return tr[tr.length - 1] === min && max / min > 4;
    }

    private getMinMaxPeriodRange(tr: number[]) {
        return tr.reduce(
            ({ min, max }: { min: number; max: number }, range: number) => {
                if (range < min) {
                    return {
                        min: range,
                        max
                    };
                }

                if (range > max) {
                    return {
                        min,
                        max: range
                    };
                }

                return {
                    min,
                    max
                };
            },
            {
                min: Number.MAX_SAFE_INTEGER,
                max: 0
            }
        );
    }

    checkStrength() {
        let strength = 0;

        let tr = this.tr.slice(-this.period - strength, this.tr.length - strength);

        while (this.isNarrowRangeBar(tr)) {
            strength++;
            tr = this.tr.slice(-this.period - strength, this.tr.length - strength);
        }

        return strength;
    }

    isTimeForEntry(now: TimestampType) {
        if (!isMarketOpen(now)) {
            LOGGER.debug("market ain't open biiatch", now);
            return null;
        }

        const timeStart = convertToLocalTime(now, " 09:34:45.000");
        const timeEnd = convertToLocalTime(now, " 10:30:00.000");

        const nowMillis = now instanceof Date ? now.getTime() : now;

        const isWithinEntryRange =
            timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

        if (!isWithinEntryRange) {
            LOGGER.debug("come back later hooomie", nowMillis);
        }

        return isWithinEntryRange;
    }

    async rebalance(
        bar: Bar,
        now: TimestampType = Date.now()
    ): Promise<PlannedTradeConfig[] | null> {
        if (!this.isTimeForEntry(now)) {
            LOGGER.warn(`not the time to enter for ${this.symbol} at ${new Date(now)}`);
            return null;
        }
        now = now instanceof Date ? now.getTime() : now;

        try {
            const entryLong = bar.h + 0.01;
            const entryShort = bar.l - 0.01;

            const unitRisk = Math.abs(entryLong - entryShort);

            const quantity = Math.ceil(TRADING_RISK_UNIT_CONSTANT / unitRisk);

            if (!quantity || quantity < 0) {
                LOGGER.error(`Expected an order for ${this.symbol} at ${now}`);
                return null;
            }

            return [
                {
                    plan: {
                        plannedEntryPrice: entryLong,
                        plannedStopPrice: entryShort,
                        plannedQuantity: quantity,
                        quantity,
                        side: PositionDirection.long,
                        symbol: this.symbol
                    },
                    config: {
                        symbol: this.symbol,
                        quantity,
                        side: TradeDirection.buy,
                        type: TradeType.stop,
                        tif: TimeInForce.day,
                        price: entryLong,
                        t: now
                    }
                },
                {
                    plan: {
                        plannedEntryPrice: entryShort,
                        plannedStopPrice: entryLong,
                        plannedQuantity: quantity,
                        quantity,
                        side: PositionDirection.short,
                        symbol: this.symbol
                    },
                    config: {
                        symbol: this.symbol,
                        quantity,
                        side: TradeDirection.sell,
                        type: TradeType.stop,
                        tif: TimeInForce.day,
                        price: entryShort,
                        t: now
                    }
                }
            ];
        } catch (e) {
            LOGGER.error(e);
            return null;
        }
    }
}
