import {
    Calendar,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { Bar } from "../core-utils/data/data.model";
import { convertToLocalTime } from "../core-utils/util/date";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import {
    SimulationStrategy,
    TelemetryModel,
} from "../simulation-helpers/simulation.strategy";
import {
    createOrderSynchronized,
    getBracketOrderForPlan,
} from "../trade-management-helpers/order";
import { TradePlan } from "../trade-management-helpers/position";
import { screenForBoomBar } from "./boomBar.simulation";
import { PROFIT_RATIO, RISK_PER_ORDER } from "./narrowRangeBar";

const isTimeForBoomBarEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:34:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:55:15.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};

export const getStopForBoomBreakout = (
    side: TradeDirection,
    boomBar: Bar,
    data: Bar[],
    nrbIndex: number
) => {
    const lookBackSubset = data.slice(-4);
    let stop: number = -1;

    const nrb = data[nrbIndex];

    const nrbMaxRewardableStop =
        side === TradeDirection.sell
            ? nrb.c + nrb.c * 0.01
            : nrb.c - nrb.c * 0.01;

    const possibleStop =
        side === TradeDirection.sell
            ? lookBackSubset.reduce((high, d) => {
                  return d.h > high && d.h < nrbMaxRewardableStop
                      ? d.h + 0.01
                      : high;
              }, Number.MIN_SAFE_INTEGER)
            : lookBackSubset.reduce((low, d) => {
                  return d.l < low && d.l > nrbMaxRewardableStop
                      ? d.l - 0.01
                      : low;
              }, Number.MAX_SAFE_INTEGER);

    const simpleHardStop = side === TradeDirection.sell ? boomBar.h : boomBar.l;

    const hardStopRoundingLimit =
        side === TradeDirection.sell
            ? simpleHardStop - 0.0025 * simpleHardStop
            : simpleHardStop + 0.0025 * simpleHardStop;

    if (hardStopRoundingLimit > possibleStop && side === TradeDirection.buy) {
        stop = simpleHardStop - 0.01;
    } else if (
        side === TradeDirection.sell &&
        hardStopRoundingLimit > possibleStop
    ) {
        stop = simpleHardStop + 0.01;
    } else {
        stop = possibleStop;
    }

    return stop;
};

export const getEntryForBoomBreakout = (
    side: TradeDirection,
    boomBar: Bar,
    data: Bar[],
    nrbIndex: number
) => {
    const nrb = data[nrbIndex];

    const entry = side === TradeDirection.buy ? nrb.h + 0.01 : nrb.l - 0.01;

    return entry;
};

export class BoomBarBreakoutSimulation
    implements SimulationStrategy<TelemetryModel> {
    private hasBoomBar: Boolean | null = null;
    public isExpectedToEnterPosition = false;
    constructor(private symbol: string, public broker: BrokerStrategy) {}
    async beforeMarketStarts(calendar: Calendar[], epoch: number) {}
    async rebalance(calendar: Calendar[], epoch: number) {
        const openPositions = await this.broker.getOpenPositions();

        const hasOpenPosition = openPositions.some(
            (p) => p.symbol === this.symbol
        );

        if (!isTimeForBoomBarEntry(epoch) || hasOpenPosition) {
            return;
        }

        const {
            boomBar,
            gap,
            isBoomBar,
            averageVol,
            data,
        } = await screenForBoomBar(calendar, epoch, this.symbol);

        if (!isBoomBar) {
            return;
        }

        const boomSide =
            Math.abs(boomBar.c - boomBar.l) < Math.abs(boomBar.c - boomBar.h)
                ? TradeDirection.sell
                : TradeDirection.buy;

        const gapSide = gap < 0 ? TradeDirection.sell : TradeDirection.buy;

        const shouldConsiderGap = gap > 1.05 || gap < 1.05;

        const ranges = data.map((b) => Math.abs(b.h - b.l));

        const nrbIndex = ranges.findIndex((r) => r * 3 < ranges[0]);

        const isWithinBoomBarRange = data.slice(1).every((b, index) => {
            const isWithinRangeSimple = b.c < boomBar.l && b.c > boomBar.h;

            if (isWithinRangeSimple) {
                return false;
            }

            const highNotGreaterThanThreshold =
                b.h < boomBar.h + boomBar.h * 0.0045 &&
                b.l > boomBar.l - boomBar.l * 0.0045;

            return highNotGreaterThanThreshold;
        });

        this.hasBoomBar = nrbIndex > 0;

        if (!isWithinBoomBarRange || !this.hasBoomBar) {
            return;
        }

        this.isExpectedToEnterPosition = true;

        const nrbBar = data[nrbIndex];

        const stop = getStopForBoomBreakout(boomSide, boomBar, data, nrbIndex);

        const entry = getEntryForBoomBreakout(
            boomSide,
            boomBar,
            data,
            nrbIndex
        );

        const risk = Math.abs(entry - stop);

        const qty = RISK_PER_ORDER / risk;

        const takeProfitLimit =
            boomSide === TradeDirection.buy
                ? entry + PROFIT_RATIO * risk
                : entry - PROFIT_RATIO * risk;

        const plan: TradePlan = {
            symbol: this.symbol,
            side:
                boomSide === TradeDirection.sell
                    ? PositionDirection.short
                    : PositionDirection.long,
            quantity: qty,
            stop,
            limit_price: -1,
            target: takeProfitLimit,
            entry,
        };
        const unfilledOrder = getBracketOrderForPlan(plan);

        await createOrderSynchronized(plan, unfilledOrder, this.broker);
    }
    async beforeMarketCloses(epoch: number) {}
    async onMarketClose(epoch: number) {}
    async afterEntryTimePassed(epoch: number) {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForBoomBarEntry(epoch);
    }
    isInPlay() {
        return !!this.hasBoomBar;
    }
    private telemetryModel: TelemetryModel = {
        marketGap: 0,
        maxPnl: 0,
        gap: 0,
    };
    async logTelemetryForProfitHacking(
        position: ClosedMockPosition,
        calendar: Calendar[],
        epoch: number
    ) {
        return this.telemetryModel;
    }
}
