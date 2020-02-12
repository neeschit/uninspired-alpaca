"use strict";
import { getAverageDirectionalIndex, IndicatorValue } from "../indicator/adx";
import {
    getOverallTrend,
    getRecentTrend,
    TrendType
} from "../pattern/trend/trendIdentifier";
import {
    getVolumeProfile,
    getNextResistance,
    VolumeProfileBar
} from "../indicator/volumeProfile";
import { assessRisk } from "../services/riskManagement.service";
import { Bar } from "../connection/bar";

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

    constructor({
        period,
        symbol,
        bars
    }: {
        period: number;
        symbol: string;
        bars: Bar[];
    }) {
        if (period < 4) {
            throw new Error("fix da shiz");
        }
        this.period = period;
        this.symbol = symbol;
        this.bars = bars;

        const { adx, pdx, ndx, atr, tr } = getAverageDirectionalIndex(
            this.bars
        );
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
        const stop = !this.isShort
            ? this.bars.slice(-1)[0].l
            : this.bars.slice(-1)[0].h;

        return roundHalf(stop);
    }

    get isShort() {
        const overallTrend = getOverallTrend(this.bars);
        const recentTrend = getRecentTrend(this.bars.slice(-2));

        return overallTrend === TrendType.down && recentTrend === TrendType.up;
    }

    get entry() {
        const isShort = this.isShort;

        const entry = isShort
            ? this.bars.slice(-1)[0].l
            : this.bars.slice(-1)[0].h;

        return roundHalf(entry);
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

        let tr = this.tr.slice(
            -this.period - strength,
            this.tr.length - strength
        );

        while (this.isNarrowRangeBar(tr)) {
            strength++;
            tr = this.tr.slice(
                -this.period - strength,
                this.tr.length - strength
            );
        }

        return strength;
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

        const potentialRewards = resistances.map((r: number) =>
            Math.abs(this.entry - r)
        );

        const hasPotential = potentialRewards.some(
            (r: number) => r / risk >= 2
        );

        return hasPotential;
    }

    toString() {
        return `Looking to ${this.isShort ? "SHORT" : "LONG"} ${
            this.symbol
        } at ${this.entry}, stop - ${this.stopPrice}`;
    }
}

function roundHalf(num: number) {
    return Math.round(num * 2) / 2;
}
