import { TrendType } from "../pattern/trend/trendIdentifier";
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
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { convertToLocalTime } from "../util/date";
import { Broker } from "@neeschit/alpaca-trade-api";
import { alpaca } from "../resources/alpaca";
import { getAverageTrueRange } from "../indicator/trueRange";
import { isSameDay } from "date-fns";
import { roundHalf } from "../util";
import { validatePositionEntryPlan } from "../services/tradeManagement";
import { getDirectionalMovementIndex } from "../indicator/dmi";

export class NarrowRangeBarStrategy {
    symbol: string;
    broker: Broker;
    atr: number;
    nrbTimestamps: number[] = [];
    nrbs: Bar[] = [];
    lastScreenedTimestamp = 0;
    lastEntryAttemptedTimestamp = 0;
    closePrice = 0;
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

        const { atr } = getAverageTrueRange(bars, false);

        this.closePrice = bars[bars.length - 1].c;

        this.atr = atr[atr.length - 1].value;
    }

    screenForNarrowRangeBars(bars: Bar[], currentEpoch = Date.now()) {
        if (!this.isTimeForEntry(currentEpoch)) {
            return;
        }
        const filteredBars = bars.filter((b) => isMarketOpen(b.t));

        const todaysBars = filteredBars.filter((b) => isSameDay(b.t, currentEpoch));

        const { tr } = getAverageTrueRange(todaysBars);

        const filteredRanges = tr.filter((range) => range.t <= currentEpoch);

        if (!filteredRanges || filteredRanges.length < 2) {
            return;
        }

        for (const range of filteredRanges) {
            const index = tr.findIndex((r) => r.t === range.t);

            if (index < 0) {
                throw new Error("boohoo");
            }

            const ranges = tr.slice(Math.max(0, index - 7), index + 1).map((r) => r.value);

            if (this.isNarrowRangeBar(ranges, todaysBars, range)) {
                const text = `Looking like a good entry for ${this.symbol} at ${new Date(
                    range.t
                ).toISOString()}`;
                LOGGER.debug(text);

                const index = this.nrbTimestamps.findIndex((t) => t === range.t);
                if (index < 0 && this.lastScreenedTimestamp < range.t) {
                    this.nrbTimestamps.push(range.t);
                    const bar = bars.find((b) => b.t === range.t);

                    if (bar) {
                        this.nrbs.push(bar);
                    }
                }
            }
        }

        this.lastScreenedTimestamp = filteredRanges[filteredRanges.length - 1].t;
    }

    get direction() {
        const entryBar = this.nrbs[this.nrbs.length - 1];
        const roundedLow = Math.round(entryBar.l);
        const roundedHigh = Math.round(entryBar.h);

        if (roundedHigh === entryBar.h && roundedLow === entryBar.l) {
            LOGGER.warn(
                `This is a weird one ${this.symbol} at ${new Date(entryBar.t).toLocaleString()}`
            );
        }

        if (Math.abs(roundedHigh - entryBar.h) < 0.04) {
            return TradeDirection.buy;
        }

        if (Math.abs(roundedLow - entryBar.l) < 0.04) {
            return TradeDirection.sell;
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
        const { max } = this.getMinMaxPeriodRange(tr.slice(-7));

        const { min } = this.getMinMaxPeriodRange(tr.slice(-3));

        const isNarrowRangeBar = range.value === min;

        const bar = bars.find((b) => b.t === range.t);

        if (!bar) {
            return false;
        }

        const roundedLow = Math.round(bar.l);
        const roundedHigh = Math.round(bar.h);

        return (
            isNarrowRangeBar &&
            (Math.abs(roundedLow - bar.l) < 0.04 || Math.abs(roundedHigh - bar.h) < 0.04) &&
            this.isVeryNarrowRangeBar(max, min)
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

    isTimeForEntry(now: TimestampType) {
        const timeStart = convertToLocalTime(now, " 09:44:45.000");
        const timeEnd = convertToLocalTime(now, " 15:30:00.000");

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
        if (!this.isTimeForEntry(now)) {
            LOGGER.trace(`not the time to enter for ${this.symbol} at ${new Date(now)}`);
            return null;
        }
        now = now instanceof Date ? now.getTime() : now;

        const { atr } = getAverageTrueRange(recentBars, false);

        if (!currentPositions) {
            currentPositions = await this.broker.getPositions();
        }

        const notCurrentPosition =
            currentPositions.findIndex((p) => p.symbol === this.symbol) === -1;

        if (!notCurrentPosition) {
            return null;
        }

        const lastBar = recentBars[recentBars.length - 1];

        const { pdmi, ndmi } = getDirectionalMovementIndex(recentBars);

        const trend = pdmi[pdmi.length - 1] > ndmi[ndmi.length - 1] ? TrendType.up : TrendType.down;

        try {
            const currentIntradayAtr = atr[atr.length - 1].value;
            const plan = this.getPlan(trend, currentIntradayAtr, lastBar);

            if (plan) {
                const isInvalid = validatePositionEntryPlan(recentBars, plan?.config.side);

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
    getEntryPrices(entryBar: Bar): { entryLong: any; entryShort: any } {
        return {
            entryLong: Math.max(Math.round(entryBar.h), entryBar.h) + 0.01,
            entryShort: Math.min(Math.round(entryBar.l), entryBar.l) - 0.01,
        };
    }

    getPlan(trend: TrendType, currentIntradayAtr: number, lastBar: Bar) {
        if (!this.nrbs.length) {
            return null;
        }

        if (!this.direction) {
            return null;
        }

        if (trend === TrendType.sideways) {
            return null;
        }

        if (trend === TrendType.up && this.direction === TradeDirection.sell) {
            return null;
        } else if (trend === TrendType.down && this.direction === TradeDirection.buy) {
            return null;
        }

        const stopUnits = assessRisk(this.atr, currentIntradayAtr, lastBar.c);

        const entryBar = this.nrbs[this.nrbs.length - 1];

        const { entryLong, entryShort } = this.getEntryPrices(entryBar);

        if (lastBar.c > entryLong && this.direction === TradeDirection.buy) {
            return null;
        }

        if (lastBar.c < entryShort && this.direction === TradeDirection.sell) {
            return null;
        }

        const entryPrice = this.direction === TradeDirection.buy ? entryLong : entryShort;

        const stop = getActualStop(
            entryPrice,
            currentIntradayAtr,
            this.direction === TradeDirection.sell,
            this.atr
        );
        const unitRisk = stopUnits;

        const quantity = Math.ceil(TRADING_RISK_UNIT_CONSTANT / stopUnits);

        if (!quantity || quantity < 0) {
            LOGGER.error(`Expected an order for ${this.symbol} at ${lastBar.t}`);
            return null;
        }

        const riskAtrRatio = currentIntradayAtr / unitRisk;

        const allowedSlippage = Number((currentIntradayAtr / 10).toFixed(2));

        if (this.direction === TradeDirection.buy) {
            this.lastEntryAttemptedTimestamp = lastBar.t;
            const plan = {
                plannedEntryPrice: entryLong,
                plannedStopPrice: stop,
                riskAtrRatio,
                quantity,
                side: PositionDirection.long,
                symbol: this.symbol,
            };

            return {
                plan,
                config: {
                    symbol: this.symbol,
                    quantity,
                    side: TradeDirection.buy,
                    type: TradeType.stop_limit,
                    tif: TimeInForce.day,
                    stopPrice: entryLong,
                    price: entryLong + allowedSlippage,
                    t: lastBar.t,
                },
            };
        } else if (this.direction === TradeDirection.sell) {
            this.lastEntryAttemptedTimestamp = lastBar.t;
            const plan = {
                plannedEntryPrice: entryShort,
                plannedStopPrice: stop,
                riskAtrRatio,
                quantity,
                side: PositionDirection.short,
                symbol: this.symbol,
            };

            return {
                plan,
                config: {
                    symbol: this.symbol,
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
    }

    resetEntryNrbs() {
        this.nrbs = [];
        this.nrbTimestamps = [];
    }
}
