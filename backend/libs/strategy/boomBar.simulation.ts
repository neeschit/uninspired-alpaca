import {
    Calendar,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays, endOfDay, parseISO, startOfDay } from "date-fns";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import { assessRisk } from "../core-indicators/services/riskManagement";
import { PeriodType } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import {
    selectAverageRangeFirstBarForWindowLive,
    selectAverageVolumeFirstBarForWindow,
    selectAverageVolumeFirstBarForWindowLive,
} from "../core-utils/resources/firstFiveMinBar";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertBars,
    getData,
    getSimpleData,
    getBucketedBarsForDay,
    getGapForSymbol,
    getSortedBarsUntilEpoch,
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

export const getBoomBarData = async (
    calendar: Calendar[],
    epoch: number,
    symbol: string
) => {
    const marketStartEpochToday = Simulator.getMarketOpenTimeForDay(
        epoch,
        calendar
    );

    const minutesSinceMarketOpen =
        epoch > marketStartEpochToday
            ? Math.floor((epoch - marketStartEpochToday) / 300000)
            : 0;

    if (!minutesSinceMarketOpen) {
        return [];
    }

    const data = await getData(
        symbol,
        marketStartEpochToday,
        "5 minutes",
        epoch
    );

    return data.slice(0, minutesSinceMarketOpen);
};

export const screenForBoomBar = async (
    calendar: Calendar[],
    epoch: number,
    symbol: string
) => {
    const marketStartEpochToday = Simulator.getMarketOpenTimeForDay(
        epoch,
        calendar
    );

    const data = await getBoomBarData(calendar, epoch, symbol);

    const premarketEpoch = Simulator.getPremarketTimeForDay(epoch, calendar);
    const ydayOpen = Simulator.getMarketOpenTimeForYday(epoch, calendar);

    const boomBar = data[0];

    let isBoomBar = false;

    const range = Math.abs(boomBar.h - boomBar.l);

    const averageVol = await selectAverageVolumeFirstBarForWindowLive(
        symbol,
        90,
        epoch
    );

    const averageFirstBarRange = await selectAverageRangeFirstBarForWindowLive(
        symbol,
        epoch
    );

    if (range > 3 * averageFirstBarRange!) {
        isBoomBar = true;
    } else {
        isBoomBar = false;
    }

    const bodyRange = Math.abs(boomBar.o - boomBar.c);
    const wicksRange =
        boomBar.o > boomBar.c
            ? Math.abs(boomBar.h - boomBar.o) + Math.abs(boomBar.l - boomBar.c)
            : Math.abs(boomBar.h - boomBar.c) + Math.abs(boomBar.l - boomBar.o);

    if (wicksRange / bodyRange > 0.15) {
        isBoomBar = false;
    }

    const gap = await getGapForSymbol(
        symbol,
        ydayOpen,
        epoch,
        premarketEpoch,
        marketStartEpochToday
    );

    return {
        isBoomBar,
        data,
        averageVol,
        gap,
        boomBar,
    };
};

const isTimeForBoomBarEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:34:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:35:15.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};

export interface BoomBarInflationModel extends TelemetryModel {
    atrFromYday: number;
    maxRange: number;
    relativeVol: number;
}

export class BoomBarSimulation
    implements SimulationStrategy<BoomBarInflationModel> {
    private isScreened: boolean | null = null;
    private atrFromYdayClose = 0;
    private maxRange = 0;
    private hasCachedData = false;
    private dailyAtr = 0;
    private telemetryModel: TelemetryModel = {
        marketGap: 0,
        maxPnl: 0,
        gap: 0,
    };

    private firstBarVolume = 0;

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
                await batchInsertBars(
                    todaysMinutes[this.symbol],
                    this.symbol,
                    true
                );
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

        const premarketOpenToday = Simulator.getPremarketTimeForDay(
            epoch,
            calendar
        );
        const marketOpenToday = Simulator.getMarketOpenTimeForDay(
            epoch,
            calendar
        );

        const ydaysBars = await getBucketedBarsForDay(this.symbol, ydayOpen);

        const filteredBars = ydaysBars.filter((b) =>
            isMarketOpen(calendar, b.t)
        );

        this.telemetryModel.marketGap = await getGapForSymbol(
            "SPY",
            ydayOpen,
            epoch,
            premarketOpenToday,
            marketOpenToday
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

        const {
            data,
            boomBar,
            gap,
            isBoomBar,
            averageVol,
        } = await screenForBoomBar(calendar, epoch, this.symbol);

        this.firstBarVolume = boomBar.v;
        this.isScreened = isBoomBar;

        const ydayBars = await getSortedBarsUntilEpoch(this.symbol, epoch);

        const atrBars = [...ydayBars, ...data];

        const { atr: atrList } = getAverageTrueRange(atrBars);

        const atrValue = atrList.length && atrList.pop()?.value;

        const atr = atrValue || 3 * this.atrFromYdayClose;

        const riskUnitsInitial = atr * 1.2;
        const riskUnits = Math.min(
            riskUnitsInitial,
            Math.abs(boomBar.h - boomBar.l) * 0.75
        );

        if (
            gap > 1.8 ||
            gap < -1.8 ||
            boomBar.c < 10 ||
            this.telemetryModel.marketGap > 1.8 ||
            this.telemetryModel.marketGap < -1.8 ||
            !isBoomBar /* ||
            this.firstBarVolume / averageVol! < 1 ||
            gap > 1 ||
            gap < -1 ||
            range < 3 * this.maxRange */
        ) {
            return;
        }

        const side =
            Math.abs(boomBar.c - boomBar.l) < Math.abs(boomBar.c - boomBar.h)
                ? TradeDirection.sell
                : TradeDirection.buy;

        const stop =
            side === TradeDirection.sell
                ? boomBar.c + riskUnits
                : boomBar.c - riskUnits;

        const qty = RISK_PER_ORDER / riskUnits;

        const takeProfitLimit =
            side === TradeDirection.buy
                ? boomBar.c + PROFIT_RATIO * riskUnits
                : boomBar.c - PROFIT_RATIO * riskUnits;

        const entry = -1;
        const limit_price =
            side === TradeDirection.sell
                ? boomBar.c - atr * 0.05
                : boomBar.c + atr * 0.05;

        const plan: TradePlan = {
            symbol: this.symbol,
            side:
                side === TradeDirection.sell
                    ? PositionDirection.short
                    : PositionDirection.long,
            quantity: qty,
            stop,
            limit_price,
            target: takeProfitLimit,
            entry,
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

        this.telemetryModel.marketGap = this.telemetryModel.marketGap;

        this.telemetryModel.gap = await getGapForSymbol(
            this.symbol,
            ydayOpen,
            epoch,
            premarketOpenToday,
            marketOpenToday
        );

        const entryTime = parseISO(p.entryTime).getTime();
        const exitTime = parseISO(p.exitTime).getTime();

        const bars = await getSimpleData(
            this.symbol,
            entryTime,
            true,
            p.totalPnl > 0 ? epoch : exitTime
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

        const averageVol = await selectAverageVolumeFirstBarForWindow(
            p.symbol,
            90
        );

        if (!averageVol) {
            throw new Error("expected average vol");
        }

        return {
            ...this.telemetryModel,
            atrFromYday: this.atrFromYdayClose,
            maxRange: this.maxRange,
            relativeVol: this.firstBarVolume / averageVol,
        };
    }
}
