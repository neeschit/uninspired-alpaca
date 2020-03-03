import { EventEmitter } from "events";
import { addMilliseconds, addDays } from "date-fns";
import Sinon from "sinon";
import {
    TradeConfig,
    PositionConfig,
    SymbolContainingConfig,
    DefaultDuration,
    PeriodType,
    FilledPositionConfig,
    OrderStatus,
    TradeDirection,
    PositionDirection,
    TradeType
} from "../data/data.model";
import { isMarketOpen, isMarketOpening } from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";
import { rebalancePosition } from "./tradeManagement";

export class Backtester {
    currentDate: Date;
    pastTradeConfigs: TradeConfig[] = [];
    pendingTradeConfigs: TradeConfig[] = [];
    currentPositionConfigs: FilledPositionConfig[] = [];
    pastPositionConfigs: FilledPositionConfig[] = [];
    strategyInstances: NarrowRangeBarStrategy[] = [];
    activeStrategyInstances: NarrowRangeBarStrategy[] = [];
    daysElapsed: number = 0;
    clock: Sinon.SinonFakeTimers;

    constructor(
        private updateIntervalMillis: number,
        private startDate: Date,
        private endDate: Date,
        private configuredSymbols: string[]
    ) {
        this.currentDate = startDate;
        this.clock = Sinon.useFakeTimers(startDate);
    }

    async screenSymbols() {
        const symbols = this.configuredSymbols.filter(symbol =>
            this.strategyInstances.every(i => i.symbol !== symbol)
        );

        const generator = this.getBarDataGenerator(symbols);

        for await (const { symbol, bars } of generator(this.currentDate)) {
            this.strategyInstances.push(
                new NarrowRangeBarStrategy({
                    period: 7,
                    symbol,
                    bars
                })
            );
        }

        const shouldBeAdded = this.strategyInstances.filter(
            instance =>
                instance.checkIfFitsStrategy() &&
                this.activeStrategyInstances.every(
                    i => i.symbol !== instance.symbol
                )
        );

        this.activeStrategyInstances.push(...shouldBeAdded);
    }

    async getScreenedSymbols() {
        await this.screenSymbols();

        return this.activeStrategyInstances;
    }

    getBarDataGenerator(
        symbols: string[],
        duration: DefaultDuration = DefaultDuration.one,
        period: PeriodType = PeriodType.day,
        lookback: number = 150
    ) {
        return async function*(currentDate: Date) {
            for (const symbol of symbols) {
                const bars = await getBarsByDate(
                    symbol,
                    addDays(currentDate, -lookback),
                    currentDate,
                    duration,
                    period
                );

                yield {
                    bars,
                    symbol
                };
            }
        };
    }

    getTimeSeriesGenerator() {
        const context = this;

        return function*() {
            for (
                let i = context.currentDate.getTime();
                i < context.endDate.getTime();
                i += context.updateIntervalMillis
            ) {
                const prevDate = context.currentDate;

                context.clock.tick(context.updateIntervalMillis);

                yield prevDate;
                /* 
                console.log(prevDate);

                console.log(context.pendingTradeConfigs); */

                context.incrementDate();
            }
        };
    }

    async simulate() {
        const gen = this.getTimeSeriesGenerator();

        for await (const {} of gen()) {
            if (isMarketOpen(this.currentDate)) {
                this.tradeUpdater.emit("interval_hit");

                const filteredInstances = this.activeStrategyInstances.filter(
                    i => {
                        return this.pendingTradeConfigs.every(
                            c => c.symbol !== i.symbol
                        );
                    }
                );

                const potentialTradesToPlace = filteredInstances.map(i =>
                    i.rebalance(this.currentDate)
                );

                for await (const promiseResult of potentialTradesToPlace) {
                    if (promiseResult) {
                        if (this.validateTrade(promiseResult)) {
                            this.pendingTradeConfigs.push(promiseResult);
                        } else {
                            console.log(
                                "cannot verify " + JSON.stringify(promiseResult)
                            );
                        }
                    }
                }

                const enteredSymbols = await this.executeAndRecord();
            }
            if (isMarketOpening(this.currentDate)) {
                this.tradeUpdater.emit("market_opening");
                await this.getScreenedSymbols();
            }
        }
    }

    validateTrade(promiseResult: TradeConfig) {
        const currentPosition = this.currentPositionConfigs.find(
            c => c.symbol === promiseResult.symbol
        );

        if (!currentPosition) {
            return true;
        }

        if (currentPosition.side === PositionDirection.long) {
            return promiseResult.side === TradeDirection.sell;
        } else {
            return promiseResult.side === TradeDirection.buy;
        }
    }

    tradeUpdater: EventEmitter = new EventEmitter();

    incrementDate() {
        this.currentDate = addMilliseconds(
            this.currentDate,
            this.updateIntervalMillis
        );
    }

    goToNextDay() {
        this.reset();
        this.currentDate = addDays(this.startDate, ++this.daysElapsed);
        this.tradeUpdater.emit("next_day", this.currentDate);
    }

    private reset() {
        this.strategyInstances = [];
    }

    public async executeAndRecord() {
        if (!this.pendingTradeConfigs || !this.pendingTradeConfigs.length) {
            return [];
        }

        const symbols = this.pendingTradeConfigs.map(p => p.symbol);

        const generator = this.getBarDataGenerator(
            symbols,
            DefaultDuration.five,
            PeriodType.minute,
            1
        );

        const newlyExecutedSymbols = [];

        for await (const barData of generator(addDays(this.currentDate, 1))) {
            const instance = this.strategyInstances.find(
                i => i.symbol === barData.symbol
            );

            const tradePlan = this.pendingTradeConfigs.find(
                c => c.symbol === barData.symbol
            );

            const side =
                tradePlan!.side === TradeDirection.buy
                    ? PositionDirection.long
                    : PositionDirection.short;

            const entry = instance!.entry;

            const barIndex = barData.bars.findIndex(
                b => b.t > this.currentDate.getTime()
            );

            const bar = barData.bars[barIndex + 1];

            const exit = instance!.stopPrice;

            if (bar.h > entry) {
                // simulate entry
                const position: FilledPositionConfig = {
                    symbol: barData.symbol,
                    originalQuantity: tradePlan!.quantity,
                    hasHardStop: false,
                    plannedEntryPrice: entry,
                    plannedStopPrice: exit,
                    plannedQuantity: tradePlan!.quantity,
                    plannedRiskUnits: Math.abs(entry - exit),
                    side: side,
                    quantity: tradePlan!.quantity,
                    order: {
                        filledQuantity: tradePlan!.quantity,
                        symbol: barData.symbol,
                        averagePrice: entry + Math.random() / 10,
                        status: OrderStatus.filled
                    }
                };

                this.currentPositionConfigs.push(position);
                this.pendingTradeConfigs = this.pendingTradeConfigs.filter(
                    c => c.symbol !== barData.symbol
                );
                this.pastTradeConfigs.push(tradePlan!);

                newlyExecutedSymbols.push(barData.symbol);
            }
        }

        return newlyExecutedSymbols;
    }

    public async closeAndRebalance() {
        if (!this.currentPositionConfigs) {
            return [];
        }

        const generator = this.getBarDataGenerator(
            this.currentPositionConfigs.map(p => p.symbol),
            DefaultDuration.five,
            PeriodType.minute,
            1
        );

        const trades = [];

        for await (const { symbol, bars } of generator(this.currentDate)) {
            const barIndex = bars.findIndex(
                b => b.t > this.currentDate.getTime()
            );
            const bar = bars[barIndex + 1];

            const position = this.currentPositionConfigs.find(p => p.symbol === symbol);

            trades.push(rebalancePosition(position!, bar));
        }

        return trades;
    }
}
