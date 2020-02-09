"use strict";
const { getAverageDirectionalIndex } = require("../indicator/adx.js");
const {
    getOverallTrend,
    getRecentTrend,
    TrendType
} = require("../pattern/trend/trendIdentifier.js");
const { getVolumeProfile } = require("../indicator/volumeProfile.js");
const { assessRisk } = require("../services/riskManagement.service.js");

class NarrowRangeBarStrategy {
    constructor({ period, symbol, bars }) {
        if (period < 4) {
            throw new Error("fix da shiz");
        }
        this.period = period;
        this.symbol = symbol;
        this.bars = bars;

        const [adx, pdx, ndx, atr, tr] = getAverageDirectionalIndex(this.bars);
        this.adx = adx;
        this.pdx = pdx;
        this.ndx = ndx;

        this.atr = atr;
        this.tr = tr;
    }

    get atrValue() {
        return this.atr[this.atr.length - 1].value;
    }

    get stop() {
        const overallTrend = getOverallTrend(this.bars);
        const recentTrend = getRecentTrend(this.bars.slice(-2));

        const isShort =
            overallTrend === TrendType.down && recentTrend === TrendType.up;

        const stop = !isShort
            ? this.bars.slice(-1)[0].l
            : this.bars.slice(-1)[0].h;

        return roundHalf(stop);
    }

    get entry() {
        const overallTrend = getOverallTrend(this.bars);
        const recentTrend = getRecentTrend(this.bars.slice(-2));

        const isShort =
            overallTrend === TrendType.down && recentTrend === TrendType.up;

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

    isNarrowRangeBar(tr) {
        const minPeriodRange = tr.reduce((min, range) => {
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

    getStopPrice() {
        const volumeProfile = getVolumeProfile(this.bars);
        return assessRisk(
            volumeProfile,
            this.atr.slice(-1)[0],
            this.bars.slice(-1)[0].c,
            this.entry,
            this.stop
        );
    }
}

function roundHalf(num) {
    return Math.round(num * 2) / 2;
}

module.exports = {
    NarrowRangeBarStrategy
};
