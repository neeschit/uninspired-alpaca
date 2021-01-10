import {
    Calendar,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays, endOfDay, parseISO, startOfDay } from "date-fns";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import { PeriodType } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertBars,
    getData,
    getSimpleData,
    getBucketedBarsForDay,
} from "../core-utils/resources/stockData";
import { convertToLocalTime } from "../core-utils/util/date";
import { isBacktestingEnv } from "../core-utils/util/env";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import {
    SimulationStrategy,
    TelemetryModel,
} from "../simulation-helpers/simulation.strategy";
import { Simulator } from "../simulation-helpers/simulator";
import {
    getMarketOpenMillis,
    isMarketOpen,
} from "../simulation-helpers/timing.util";
import {
    cancelOpenOrdersForSymbol,
    createOrderSynchronized,
    getBracketOrderForPlan,
} from "../trade-management-helpers/order";
import { TradePlan } from "../trade-management-helpers/position";
import { PROFIT_RATIO, RISK_PER_ORDER } from "./narrowRangeBar";

export const isTimeForBoomBarEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:34:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:35:15.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};

export interface BoomBarInflationModel extends TelemetryModel {
    atrFromYday: number;
    maxRange: number;
}

export class BoomBarSimulation
    implements SimulationStrategy<BoomBarInflationModel> {
    private isScreened: boolean | null = null;
    private atrFromYdayClose = 0;
    private maxRange = 0;
    private hasCachedData = false;
    private telemetryModel: TelemetryModel = {
        marketGap: 0,
        maxPnl: 0,
        gap: 0,
    };

    constructor(private symbol: string, public broker: BrokerStrategy) {}

    async beforeMarketStarts(calendar: Calendar[], epoch: number) {
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (!isBacktestingEnv() && !this.hasCachedData) {
            try {
                const todaysMinutes = await getPolyonData(
                    this.symbol,
                    lastBusinessDay,
                    addBusinessDays(epoch, 1),
                    PeriodType.minute
                );
                await batchInsertBars(todaysMinutes[this.symbol], this.symbol);
                this.hasCachedData = true;
            } catch (e) {
                LOGGER.error(
                    `Error inserting minute bars for ${this.symbol}`,
                    e
                );
            }
        }

        if (this.atrFromYdayClose || this.maxRange) {
            return;
        }

        const ydayOpen = Simulator.getMarketOpenTimeForYday(epoch, calendar);

        const ydaysBars = await getBucketedBarsForDay(this.symbol, ydayOpen);

        const filteredBars = ydaysBars.filter((b) =>
            isMarketOpen(calendar, b.t)
        );

        const { atr } = getAverageTrueRange(filteredBars);

        const lastAtr = atr[atr.length - 1];

        this.atrFromYdayClose = lastAtr?.value;

        this.maxRange = filteredBars.slice(-15).reduce((maxRange, bar) => {
            const range = Math.abs(bar.h - bar.l);

            return range > maxRange ? range : maxRange;
        }, 0);
    }

    async rebalance(calendar: Calendar[], epoch: number) {
        if (this.isScreened === false) {
            return;
        }

        const openPositions = await this.broker.getOpenPositions();

        const hasOpenPosition = openPositions.some(
            (p) => p.symbol === this.symbol
        );

        if (!isTimeForBoomBarEntry(epoch) && !hasOpenPosition) {
            return;
        }

        const marketStartEpochToday = getMarketOpenMillis(calendar, epoch);

        const data = await getData(
            this.symbol,
            marketStartEpochToday,
            "5 minutes",
            endOfDay(marketStartEpochToday).getTime()
        );

        const lastBar = data[0];

        const range = Math.abs(lastBar.h - lastBar.l);

        if (range > 3 * this.atrFromYdayClose && lastBar.v > 500000) {
            this.isScreened = true;
        } else {
            this.isScreened = false;
            return;
        }

        const side =
            Math.abs(lastBar.c - lastBar.l) < Math.abs(lastBar.c - lastBar.h)
                ? TradeDirection.sell
                : TradeDirection.buy;

        const stop = side === TradeDirection.sell ? lastBar.h : lastBar.l;

        const risk = Math.abs(lastBar.c - stop);

        const qty = RISK_PER_ORDER / risk;

        const takeProfitLimit =
            side === TradeDirection.buy
                ? lastBar.h + PROFIT_RATIO * risk
                : lastBar.l - PROFIT_RATIO * risk;

        const plan: TradePlan = {
            symbol: this.symbol,
            side:
                side === TradeDirection.sell
                    ? PositionDirection.short
                    : PositionDirection.long,
            quantity: qty,
            stop,
            limit_price: -1,
            target: takeProfitLimit,
            entry: -1,
        };
        const unfilledOrder = getBracketOrderForPlan(plan);

        await createOrderSynchronized(plan, unfilledOrder, this.broker);
    }
    async afterEntryTimePassed(epoch: number) {}

    async beforeMarketCloses(epoch: number) {
        if (!this.isInPlay()) {
            return;
        }
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }

    async onMarketClose() {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForBoomBarEntry(epoch);
    }

    isInPlay() {
        return this.isScreened === true;
    }

    async logTelemetryForProfitHacking(
        p: ClosedMockPosition,
        calendar: Calendar[],
        epoch: number
    ) {
        const ydayOpen = Simulator.getMarketOpenTimeForYday(epoch, calendar);

        const premarketOpenToday = Simulator.getPremarketTimeForDay(
            epoch,
            calendar
        );
        const marketOpenToday = Simulator.getMarketOpenTimeForDay(
            epoch,
            calendar
        );

        const marketGapBars = await getSimpleData(
            "SPY",
            startOfDay(ydayOpen).getTime(),
            false,
            epoch
        );

        if (marketGapBars.length > 1) {
            this.telemetryModel.marketGap =
                (marketGapBars[1].o - marketGapBars[0].c) / marketGapBars[1].o;
        } else if (marketGapBars.length > 0) {
            const todaysMarketOpenBars = await getSimpleData(
                "SPY",
                premarketOpenToday,
                true,
                marketOpenToday + 60000
            );

            const openBar =
                todaysMarketOpenBars[todaysMarketOpenBars.length - 1];
            this.telemetryModel.marketGap =
                (openBar.o - marketGapBars[0].c) / openBar.o;
        }

        this.telemetryModel.marketGap *= 100;

        const closeBarsYday = await getSimpleData(
            this.symbol,
            startOfDay(ydayOpen).getTime(),
            false,
            epoch
        );

        if (closeBarsYday.length > 1) {
            this.telemetryModel.gap =
                (closeBarsYday[1].o - closeBarsYday[0].c) / closeBarsYday[1].o;
        } else if (closeBarsYday.length > 0) {
            const todaysOpenBars = await getSimpleData(
                this.symbol,
                premarketOpenToday,
                true,
                marketOpenToday + 60000
            );

            const openBar = todaysOpenBars[todaysOpenBars.length - 1];
            this.telemetryModel.gap =
                (openBar.o - closeBarsYday[0].c) / openBar.o;
        }

        this.telemetryModel.gap *= 100;

        const entryTime = parseISO(p.entryTime).getTime();
        const exitTime = parseISO(p.exitTime).getTime();

        const bars = await getSimpleData(
            this.symbol,
            entryTime,
            true,
            exitTime
        );

        const maxExit = bars.reduce(
            (maxExit, b) => {
                if (p.side === PositionDirection.long) {
                    return b.h > maxExit ? b.h : maxExit;
                } else {
                    return b.l < maxExit ? b.l : maxExit;
                }
            },
            p.side === PositionDirection.long
                ? Number.MIN_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER
        );

        const riskInCents = Math.abs(p.plannedEntryPrice - p.plannedExitPrice!);

        this.telemetryModel.maxPnl =
            Math.abs(maxExit - p.averageEntryPrice) / riskInCents;

        return {
            ...this.telemetryModel,
            atrFromYday: this.atrFromYdayClose,
            maxRange: this.maxRange,
        };
    }
}
