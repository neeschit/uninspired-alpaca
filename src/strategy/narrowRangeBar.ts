import { getAverageDirectionalIndex, IndicatorValue } from "../indicator/adx";
import { getOverallTrend, getRecentTrend, TrendType } from "../pattern/trend/trendIdentifier";
import { getVolumeProfile, VolumeProfileBar } from "../indicator/volumeProfile";
import { TRADING_RISK_UNIT_CONSTANT } from "../services/riskManagement";
import { isMarketOpen } from "../util/market";
import {
    TimestampType,
    Bar,
    TradeDirection,
    TradeType,
    TimeInForce,
    PlannedTradeConfig,
    PositionDirection,
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";
import { Broker } from "@neeschit/alpaca-trade-api";
import { alpaca } from "../resources/alpaca";
import { getAverageTrueRange } from "../indicator/trueRange";

export class NarrowRangeBarStrategy {
    symbol: string;
    broker: Broker;
    atr: number;
    nrbTimestamps: number[] = [];

    constructor({
        symbol,
        broker = alpaca,
        bars,
    }: {
        symbol: string;
        broker: Broker;
        bars: Bar[];
    }) {
        this.symbol = symbol;
        this.broker = broker;

        const atr = getAverageTrueRange(bars, false).atr;

        this.atr = atr[atr.length - 1].value;
    }

    screenForNarrowRangeBars(bars: Bar[], strict = true) {
        const { adx, pdx, ndx, atr, tr } = getAverageDirectionalIndex(bars);
        const isNarrowRangeBar = this.isNarrowRangeBar(tr, strict);
        return isNarrowRangeBar;
    }

    isNarrowRangeBar(tr: number[], strict: boolean) {
        const { min, max } = this.getMinMaxPeriodRange(tr);

        const isNarrowRangeBar = tr[tr.length - 1] === min;

        if (isNarrowRangeBar && strict) {
            return this.isVeryNarrowRangeBar(max, min);
        }

        return isNarrowRangeBar;
    }

    isVeryNarrowRangeBar(max: number, min: number) {
        LOGGER.info(max / min);

        return max / min > 3;
    }

    private getMinMaxPeriodRange(tr: number[]) {
        return tr.reduce(
            ({ min, max }: { min: number; max: number }, range: number) => {
                if (range < min) {
                    return {
                        min: range,
                        max,
                    };
                }

                if (range > max) {
                    return {
                        min,
                        max: range,
                    };
                }

                return {
                    min,
                    max,
                };
            },
            {
                min: Number.MAX_SAFE_INTEGER,
                max: 0,
            }
        );
    }

    isTimeForEntry(now: TimestampType) {
        if (!isMarketOpen(now)) {
            LOGGER.debug("market ain't open biiatch", now);
            return null;
        }

        const timeStart = convertToLocalTime(now, " 09:34:45.000");

        const nowMillis = now instanceof Date ? now.getTime() : now;

        const isWithinEntryRange = timeStart.getTime() <= nowMillis;

        if (!isWithinEntryRange) {
            LOGGER.debug("come back later hooomie", nowMillis);
        }

        return isWithinEntryRange;
    }

    async onTradeUpdate(currentBar: Bar, entryBar: Bar, now: TimestampType = Date.now()) {
        return this.rebalance(currentBar, entryBar, now);
    }

    async rebalance(
        currentBar: Bar,
        entryBar: Bar,
        now: TimestampType = Date.now()
    ): Promise<PlannedTradeConfig | null> {
        if (!this.isTimeForEntry(now)) {
            LOGGER.warn(`not the time to enter for ${this.symbol} at ${new Date(now)}`);
            return null;
        }
        now = now instanceof Date ? now.getTime() : now;

        const currentPositions = await this.broker.getPositions();

        const notCurrentPosition =
            currentPositions.findIndex((p) => p.symbol === this.symbol) === -1;

        if (!notCurrentPosition) {
            return null;
        }

        try {
            return this.getPlan(entryBar, currentBar, now);
        } catch (e) {
            LOGGER.error(e);
            return null;
        }
    }
    getEntryPrices(entryBar: Bar): { entryLong: any; entryShort: any } {
        return {
            entryLong: entryBar.h + 0.01,
            entryShort: entryBar.l - 0.01,
        };
    }

    getPlan(entryBar: Bar, currentBar: Bar, now = Date.now()) {
        const { entryLong, entryShort } = this.getEntryPrices(entryBar);
        const unitRisk = Math.abs(entryLong - entryShort);

        const quantity = Math.ceil(TRADING_RISK_UNIT_CONSTANT / unitRisk);

        if (!quantity || quantity < 0) {
            LOGGER.error(`Expected an order for ${this.symbol} at ${now}`);
            return null;
        }

        const riskAtrRatio = unitRisk / this.atr;

        if (currentBar.h > entryBar.h) {
            return {
                plan: {
                    plannedEntryPrice: entryLong,
                    plannedStopPrice: entryShort,
                    riskAtrRatio,
                    quantity,
                    side: PositionDirection.long,
                    symbol: this.symbol,
                },
                config: {
                    symbol: this.symbol,
                    quantity,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: entryLong,
                    t: now,
                },
            };
        } else if (currentBar.l < entryBar.l) {
            return {
                plan: {
                    plannedEntryPrice: entryShort,
                    plannedStopPrice: entryLong,
                    riskAtrRatio,
                    quantity,
                    side: PositionDirection.short,
                    symbol: this.symbol,
                },
                config: {
                    symbol: this.symbol,
                    quantity,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: entryShort,
                    t: now,
                },
            };
        }

        return null;
    }
}
