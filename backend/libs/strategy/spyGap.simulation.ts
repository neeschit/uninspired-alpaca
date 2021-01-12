import {
    Calendar,
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays, parseISO, startOfDay } from "date-fns";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getTrueRange } from "../core-indicators/indicator/trueRange";
import { DefaultDuration, PeriodType } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertBars,
    batchInsertDailyBars,
    getGapForSymbol,
    getSimpleData,
} from "../core-utils/resources/stockData";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import {
    SimulationStrategy,
    TelemetryModel,
} from "../simulation-helpers/simulation.strategy";
import { Simulator } from "../simulation-helpers/simulator";
import { FIFTEEN_MINUTES } from "../simulation-helpers/timing.util";
import {
    cancelOpenOrdersForSymbol,
    persistAndCreateAlpacaOrder,
    createOrderSynchronized,
    UnfilledOrder,
} from "../trade-management-helpers/order";
import {
    PersistedTradePlan,
    TradePlan,
} from "../trade-management-helpers/position";

export class SpyGapCloseSimulation
    implements SimulationStrategy<TelemetryModel> {
    private isGapDay = false;
    private hasCachedData = false;
    private previousClose: number = -1;
    private side: TradeDirection | null = null;
    private plan: PersistedTradePlan | null = null;
    constructor(private symbol: string, private broker: BrokerStrategy) {}

    async beforeMarketStarts(calendar: Calendar[], epoch: number) {
        const startBusinessDay = addBusinessDays(epoch, -5);
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (this.isInPlay()) {
            return;
        }

        if (process.env.NODE_ENV !== "backtest" && !this.hasCachedData) {
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
                LOGGER.error(`Error inserting daily bar for ${this.symbol}`, e);
            }

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

        const data = await getSimpleData(
            this.symbol,
            addBusinessDays(epoch, -5).getTime(),
            false,
            lastBusinessDay.getTime()
        );
        const currentBars = await getSimpleData(
            this.symbol,
            epoch - FIFTEEN_MINUTES,
            true,
            epoch + 1000
        );

        const currentBar = currentBars[currentBars.length - 1];

        const price = currentBar.c;
        const previousClose = data[data.length - 1].c;

        const gap = Math.abs(previousClose - price);

        if (gap < 0.2) {
            this.isGapDay = false;
            return;
        }

        const previousDayRange = getTrueRange(data.slice(-2), false);

        if (gap > previousDayRange * 0.85) {
            this.isGapDay = false;
            return;
        }

        this.isGapDay = true;
        this.previousClose = previousClose;
        this.side =
            previousClose > price ? TradeDirection.buy : TradeDirection.sell;

        const unfilledOrder: UnfilledOrder = {
            symbol: this.symbol,
            tif: TimeInForce.opg,
            quantity: 100,
            side: this.side,
            type: TradeType.market,
            order_class: "simple",
        };

        const plan = {
            symbol: this.symbol,
            entry: -1,
            stop: -1,
            limit_price: -1,
            target: -1,
            side:
                this.side === TradeDirection.buy
                    ? PositionDirection.long
                    : PositionDirection.short,
            quantity: 100,
        };

        const { persistedPlan } = await createOrderSynchronized(
            plan,
            unfilledOrder,
            this.broker
        );

        this.plan = persistedPlan;
    }

    async beforeMarketCloses(epoch: number) {
        if (!this.isInPlay()) {
            return;
        }
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }

    async onMarketClose() {}

    async afterEntryTimePassed(epoch: number) {}

    async rebalance(calendar: Calendar[], epoch: number) {
        if (!this.isInPlay() || !this.plan) {
            return;
        }

        const openPositions = await this.broker.getOpenPositions();

        const isInPosition = openPositions.some(
            (p) => p.symbol === this.symbol
        );

        if (!isInPosition) {
            return;
        }

        const openOrders = await this.broker.getOpenOrders();

        if (openOrders.some((o) => o.symbol === this.symbol)) {
            return;
        }

        await persistAndCreateAlpacaOrder(
            this.plan,
            {
                symbol: this.symbol,
                trade_plan_id: this.plan.id,
                tif: TimeInForce.day,
                quantity: 100,
                side:
                    this.side! === TradeDirection.sell
                        ? TradeDirection.buy
                        : TradeDirection.sell,
                type: TradeType.limit,
                order_class: "simple",
                limit_price: this.previousClose,
            },
            this.broker
        );
    }

    hasEntryTimePassed(epoch: number) {
        return false;
    }

    isInPlay() {
        return this.isGapDay;
    }

    async logTelemetryForProfitHacking(
        p: ClosedMockPosition,
        calendar: Calendar[],
        epoch: number
    ) {
        const telemetryModel: TelemetryModel = {
            gap: 0,
            marketGap: 0,
            maxPnl: 0,
        };
        const ydayOpen = Simulator.getMarketOpenTimeForYday(epoch, calendar);

        const premarketOpenToday = Simulator.getPremarketTimeForDay(
            epoch,
            calendar
        );
        const marketOpenToday = Simulator.getMarketOpenTimeForDay(
            epoch,
            calendar
        );

        telemetryModel.marketGap = await getGapForSymbol(
            "SPY",
            ydayOpen,
            epoch,
            premarketOpenToday,
            marketOpenToday
        );
        telemetryModel.gap = telemetryModel.marketGap;

        const entryTime = parseISO(p.entryTime).getTime();

        const bars = await getSimpleData(this.symbol, entryTime, true, epoch);

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

        telemetryModel.maxPnl =
            Math.abs(maxExit - p.averageEntryPrice) / riskInCents;

        return {
            ...telemetryModel,
        };
    }
}
