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
    TimeInForce
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";

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

    entryHour: number = 9;
    entryMinuteStart: number = 34;
    entryMinuteEnd: number = 36;

    overallTrend: TrendType;
    recentTrend: TrendType;
    counterTrend: boolean;

    constructor({
        period = 7,
        symbol,
        bars,
        useSimpleRange = false,
        counterTrend = true
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

    get simpleStop() {
        const stop = !this.isShort ? this.bars.slice(-1)[0].l : this.bars.slice(-1)[0].h;

        return roundHalf(stop);
    }

    get currentPrice() {
        return this.bars[this.bars.length - 1].c;
    }

    get isShort() {
        const isDownTrend = this.overallTrend === TrendType.down;
        
        return this.counterTrend ? !isDownTrend : isDownTrend;
    }

    get entry() {
        const isShort = this.isShort;

        const entry = isShort ? this.bars.slice(-1)[0].l : this.bars.slice(-1)[0].h;

        return roundHalf(entry);
    }

    get stop() {
        return assessRisk(
            this.volumeProfile,
            this.atr.slice(-1)[0],
            this.bars.slice(-1)[0].c,
            this.entry,
            this.simpleStop
        );
    }

    get stopPrice() {
        return this.isShort ? this.entry + this.stop : this.entry - this.stop;
    }

    get side() {
        return this.isShort ? TradeDirection.sell : TradeDirection.buy;
    }

    checkIfFitsStrategy(profitRatio = 2, strict = false) {
        const ranges = this.tr.slice(-this.period);
        return strict
            ? this.isVeryNarrowRangeBar(ranges)
            : this.isNarrowRangeBar(ranges) && this.adx[this.adx.length - 1].value > 20;
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

    hasPotentialForRewards(profitRatio = 2) {
        const risk = this.stop;
        const resistances = getNextResistance(
            this.bars,
            this.isShort,
            this.entry,
            this.volumeProfile
        );
        if (!resistances || !resistances.length) {
            return true;
        }

        const potentialRewards = resistances.map((r: number) => Math.abs(this.entry - r));

        const hasPotential = potentialRewards.some((r: number) => r / risk >= profitRatio);

        return hasPotential;
    }

    toString() {
        return `overall trend is ${this.overallTrend}.
        Looking to ${this.isShort ? "SHORT" : "LONG"} ${this.symbol} at ${this.entry}, stop - ${
            this.stopPrice
        } - with close ${this.currentPrice}`;
    }

    isTimeForEntry(now: TimestampType) {
        if (!isMarketOpen(now)) {
            LOGGER.debug("market ain't open biiatch", now);
            return null;
        }

        const timeStart = convertToLocalTime(now, " 09:34:45.000");
        const timeEnd = convertToLocalTime(now, " 09:36:00.000");

        const nowMillis = now instanceof Date ? now.getTime() : now;

        const isWithinEntryRange =
            timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

        if (!isWithinEntryRange) {
            LOGGER.debug("come back later hooomie", nowMillis);
        }

        return isWithinEntryRange;
    }

    async rebalance(bar: Bar, now: TimestampType = Date.now()) {
        now = now instanceof Date ? now.getTime() : now;

        try {
            const unitRisk = Math.abs(this.entry - this.stopPrice);

            const quantity = Math.ceil(TRADING_RISK_UNIT_CONSTANT / unitRisk);

            if (!quantity || quantity < 0) {
                return null;
            }

            const price = this.isShort ? bar.l : bar.h;

            return {
                symbol: this.symbol,
                quantity,
                side: this.side,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: roundHalf(price),
                t: now
            };
        } catch (e) {
            LOGGER.error(e);
            return null;
        }
    }
}

function roundHalf(num: number) {
    return Math.round(num * 2) / 2;
}
