import { isWithinInterval, set, addDays } from "date-fns";
import { getAverageDirectionalIndex, IndicatorValue } from "../indicator/adx";
import { getOverallTrend, getRecentTrend, TrendType } from "../pattern/trend/trendIdentifier";
import { getVolumeProfile, getNextResistance, VolumeProfileBar } from "../indicator/volumeProfile";
import { assessRisk, TRADING_RISK_UNIT_CONSTANT } from "../services/riskManagement.service";
import { isMarketOpen } from "../util/market";
import { getBarsByDate } from "../data/bars";
import {
    TimestampType,
    Bar,
    TradeConfig,
    TradeDirection,
    TradeType,
    TimeInForce
} from "../data/data.model";

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

    constructor({ period, symbol, bars }: { period: number; symbol: string; bars: Bar[] }) {
        if (period < 4) {
            throw new Error("fix da shiz");
        }
        this.period = period;
        this.symbol = symbol;
        this.bars = bars;

        const { adx, pdx, ndx, atr, tr } = getAverageDirectionalIndex(this.bars);
        this.adx = adx;
        this.pdx = pdx;
        this.ndx = ndx;

        this.atr = atr;
        this.tr = tr;
        this.volumeProfile = getVolumeProfile(this.bars);
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
        const overallTrend = getOverallTrend(this.bars);
        const recentTrend = getRecentTrend(this.bars.slice(-2));

        return overallTrend === TrendType.down && recentTrend === TrendType.up;
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
        return this.isShort ? TradeDirection.short : TradeDirection.long;
    }

    checkIfFitsStrategy() {
        return (
            this.isNarrowRangeBar(this.tr.slice(-this.period)) &&
            this.adx[this.adx.length - 1].value > 30
        );
    }

    isNarrowRangeBar(tr: number[]) {
        const minPeriodRange = tr.reduce((min: number, range: number) => {
            if (range < min) {
                return range;
            }

            return min;
        }, Number.MAX_SAFE_INTEGER);

        return tr[tr.length - 1] === minPeriodRange;
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

    hasPotentialForRewards() {
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

        const hasPotential = potentialRewards.some((r: number) => r / risk >= 2);

        return hasPotential;
    }

    toString() {
        return `Looking to ${this.isShort ? "SHORT" : "LONG"} ${this.symbol} at ${
            this.entry
        }, stop - ${this.stopPrice} - with close ${this.currentPrice}`;
    }

    isTimeForEntry(now: TimestampType) {
        if (!isMarketOpen(now)) {
            return null;
        }
        return isWithinInterval(now, {
            start: set(now, {
                hours: this.entryHour,
                minutes: this.entryMinuteStart,
                seconds: 45
            }),
            end: set(now, {
                hours: this.entryHour,
                minutes: this.entryMinuteEnd,
                seconds: 0
            })
        });
    }

    async rebalance(now: TimestampType = Date.now()) {
        if (!this.isTimeForEntry(now)) {
            return null;
        }

        const lastBar = await getBarsByDate(this.symbol, addDays(now, -1), addDays(now, 1));
        const entryBarTimestamp = set(now, {
            hours: 9,
            minutes: 30,
            seconds: 0
        });

        const bar = lastBar.find(bar => bar.t === entryBarTimestamp.getTime());

        if (!bar) {
            console.error("couldnt find appropriate bar", entryBarTimestamp);
            return null;
        }

        const quantity = Math.floor(TRADING_RISK_UNIT_CONSTANT / this.stop);
        const price = this.isShort ? bar.l : bar.h;

        return {
            symbol: this.symbol,
            quantity,
            side: this.side,
            type: TradeType.stop,
            tif: TimeInForce.day,
            price: roundHalf(price)
        };
    }
}

function roundHalf(num: number) {
    return Math.round(num * 2) / 2;
}
