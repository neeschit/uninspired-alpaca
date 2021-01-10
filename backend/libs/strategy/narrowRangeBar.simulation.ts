import {
    AlpacaOrder,
    Calendar,
    PositionDirection,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays, formatISO, parseISO, startOfDay } from "date-fns";
import {
    SimulationStrategy,
    TelemetryModel,
} from "../simulation-helpers/simulation.strategy";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
    NarrowRangeBarStrategy,
} from "./narrowRangeBar";
import {
    createOrderSynchronized,
    cancelOpenOrdersForSymbol,
    getBracketOrderForPlan,
} from "../trade-management-helpers/order";
import { PeriodType, DefaultDuration } from "../core-utils/data/data.model";
import { IndicatorValue } from "../core-indicators/indicator/adx";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertDailyBars,
    getSimpleData,
    getPersistedData,
} from "../core-utils/resources/stockData";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getMarketOpenMillis } from "../simulation-helpers/timing.util";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import { Simulator } from "../simulation-helpers/simulator";

export class NarrowRangeBarSimulation
    implements SimulationStrategy<TelemetryModel> {
    private strategy?: NarrowRangeBarStrategy;
    private tr?: IndicatorValue<number>[];
    private atr?: IndicatorValue<number>[];
    private isInPlayCurrently = false;
    private telemetryModel: TelemetryModel = {
        gap: 0,
        marketGap: 0,
        maxPnl: 0,
    };

    constructor(private symbol: string, private broker: BrokerStrategy) {}
    async beforeMarketStarts(
        calendar: Calendar[],
        epoch = Date.now()
    ): Promise<void> {
        const startBusinessDay = addBusinessDays(epoch, -10);
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (process.env.NODE_ENV !== "backtest") {
            const daysMinutes = await getPolyonData(
                this.symbol,
                startBusinessDay,
                lastBusinessDay,
                PeriodType.day,
                DefaultDuration.one
            );

            try {
                await batchInsertDailyBars(
                    daysMinutes[this.symbol],
                    this.symbol
                );
            } catch (e) {
                LOGGER.error(`Error inserting for ${this.symbol}`, e);
            }
        }

        const data = await getSimpleData(
            this.symbol,
            addBusinessDays(epoch, -18).getTime(),
            false,
            lastBusinessDay.getTime()
        );

        const { tr, atr } = getAverageTrueRange(data, false);

        this.tr = tr;
        this.atr = atr;

        if (!this.atr || !this.atr.length) {
            throw new Error(
                `Should have found some atr for ${
                    this.symbol
                } on the next day after ${formatISO(lastBusinessDay)}`
            );
        }

        this.strategy = new NarrowRangeBarStrategy({
            symbol: this.symbol,
            bars: data,
            tr,
        });
    }

    isInPlay() {
        return this.isInPlayCurrently;
    }

    async rebalance(
        calendar: Calendar[],
        epoch: number
    ): Promise<AlpacaOrder | void> {
        if (!this.strategy) {
            await this.beforeMarketStarts(calendar, epoch);
        }

        if (!this.strategy!.screenForNarrowRangeBars()) {
            return;
        }

        this.isInPlayCurrently = true;

        const positions = await this.broker.getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        const marketOpenMillis = getMarketOpenMillis(calendar, epoch);

        const { data, lastBar } = await getPersistedData(
            this.symbol,
            marketOpenMillis,
            epoch
        );

        const { atr } = getAverageTrueRange(data, false);

        const currentAtr = atr!.pop()!.value;

        const plan = getSafeOrbEntryPlan({
            currentAtr,
            marketBarsSoFar: data,
            symbol: this.symbol,
            lastPrice: lastBar.c,
            openingBar: data[0],
            dailyAtr: this.atr![this.atr!.length - 1].value,
        });

        try {
            const unfilledOrder = getBracketOrderForPlan(plan);
            const order = await createOrderSynchronized(
                plan,
                unfilledOrder,
                this.broker
            );
        } catch (e) {
            if (
                e.message.indexOf("order_exists") === -1 &&
                e.message.indexOf("order_placed_recently_for_symbol") === -1
            ) {
                LOGGER.error(
                    `could not place order ${e.message} for ${this.symbol} at ${epoch}`
                );
                throw e;
            }
        }
    }
    async afterEntryTimePassed(): Promise<void> {
        const positions = await this.broker.getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
    }
    async beforeMarketCloses(epoch: number): Promise<void> {
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }
    async onMarketClose(): Promise<void> {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForOrbEntry(epoch);
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

        const riskInCents = Math.abs(
            p.plannedEntryPrice - (p.plannedExitPrice || p.plannedTargetPrice)
        );

        this.telemetryModel.maxPnl =
            Math.abs(maxExit - p.averageEntryPrice) / riskInCents;

        return {
            ...this.telemetryModel,
        };
    }
}
