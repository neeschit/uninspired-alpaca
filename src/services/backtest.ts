import { EventEmitter } from "events";
import { addMilliseconds, addDays, startOfDay, addHours, differenceInMonths } from "date-fns";
import Sinon from "sinon";
import {
    TradeConfig,
    DefaultDuration,
    PeriodType,
    FilledPositionConfig,
    OrderStatus,
    TradeDirection,
    PositionDirection,
    Bar,
    FilledTradeConfig,
    TradeType,
    PositionConfig
} from "../data/data.model";
import { isMarketOpen, isMarketOpening, isAfterMarketClose } from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";
import { rebalancePosition } from "./tradeManagement";

export class Backtester {
    currentDate: Date;
    pastTradeConfigs: FilledTradeConfig[] = [];
    pendingTradeConfigs: TradeConfig[] = [];
    currentPositionConfigs: FilledPositionConfig[] = [];
    pastPositionConfigs: FilledPositionConfig[] = [];
    strategyInstances: NarrowRangeBarStrategy[] = [];
    activeStrategyInstances: NarrowRangeBarStrategy[] = [];
    daysElapsed: number = 0;
    clock: Sinon.SinonFakeTimers;
    replayBars: {
        [index: string]: Bar[];
    } = {};
    screenerBars: {
        [index: string]: Bar[];
    } = {};

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
        const symbols = this.configuredSymbols.filter(
            symbol =>
                this.strategyInstances.every(i => i.symbol !== symbol) &&
                this.currentPositionConfigs.every(p => p.symbol !== symbol)
        );

        for (const symbol of symbols) {
            const bars = this.screenerBars[symbol].filter(
                b => b.t < startOfDay(this.currentDate).getTime()
            );
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
                this.activeStrategyInstances.every(i => i.symbol !== instance.symbol)
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

    getReplayDataGenerator(
        symbols: string[],
        duration: DefaultDuration = DefaultDuration.one,
        period: PeriodType = PeriodType.day,
        startDate: Date,
        endDate: Date
    ) {
        return async function*() {
            for (const symbol of symbols) {
                const bars = await getBarsByDate(symbol, startDate, endDate, duration, period);

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
                /* if (i % (context.updateIntervalMillis * 100) === 0) {
                    console.log(prevDate);
                } */
                /*console.log(context.pendingTradeConfigs);
                console.log(context.activeStrategyInstances.map(c => c.symbol));
                console.log(context.strategyInstances.map(c => c.symbol));
                console.log(context.currentPositionConfigs.map(c => c.symbol)); */
                i = context.currentDate.getTime();

                context.incrementDate();
            }
        };
    }

    async batchSimulate(startDate: Date, endDate: Date) {
        const replayBars = this.getReplayDataGenerator(
            this.configuredSymbols,
            this.updateIntervalMillis === 60000 ? DefaultDuration.one : DefaultDuration.five,
            PeriodType.minute,
            this.startDate,
            this.endDate
        );

        for await (const bar of replayBars()) {
            Object.assign(this.replayBars, {
                [bar.symbol]: bar.bars
            });
        }

        const screenerBars = this.getReplayDataGenerator(
            this.configuredSymbols,
            DefaultDuration.one,
            PeriodType.day,
            addDays(this.startDate, -150),
            addDays(this.endDate, 1)
        );

        for await (const bar of screenerBars()) {
            Object.assign(this.screenerBars, {
                [bar.symbol]: bar.bars
            });
        }

        const gen = this.getTimeSeriesGenerator();

        for await (const {} of gen()) {
            if (isMarketOpen(this.currentDate)) {
                this.tradeUpdater.emit("interval_hit");

                const filteredInstances = this.activeStrategyInstances.filter(i => {
                    return this.pendingTradeConfigs.every(c => c.symbol !== i.symbol);
                });

                const rebalancingPositionTrades = await this.closeAndRebalance();

                for await (const tradeRebalance of rebalancingPositionTrades) {
                    if (tradeRebalance) {
                        /* console.log(tradeRebalance); */
                        if (this.validateTrade(tradeRebalance)) {
                            await this.findPositionConfigAndRebalance(tradeRebalance);
                        }
                    }
                }

                const potentialTradesToPlace = filteredInstances.map(i =>
                    i.rebalance(this.currentDate)
                );

                for await (const promiseResult of potentialTradesToPlace) {
                    if (promiseResult) {
                        if (this.validateTrade(promiseResult)) {
                            /* console.log(promiseResult); */
                            this.pendingTradeConfigs.push(promiseResult);
                        } else {
                            console.log("cannot verify " + JSON.stringify(promiseResult));
                        }
                    }
                }

                const newlyExecutedSymbols = await this.executeAndRecord();
            }
            if (isMarketOpening(this.currentDate)) {
                this.tradeUpdater.emit("market_opening");
                await this.getScreenedSymbols();
            }

            if (isAfterMarketClose(this.currentDate)) {
                this.goToNextDay();
            }
        }
    }

    async simulate() {
        const startDate = this.startDate;
        const endDate = this.endDate;

        const difference = differenceInMonths(startDate, endDate);

        if (Math.abs(difference) > 6) {
            return null;
        }

        if (this.configuredSymbols.length > 100) {
            return null;
        }

        return this.batchSimulate(startDate, endDate);
    }

    validateTrade(tradeConfig: TradeConfig) {
        const currentPosition = this.currentPositionConfigs.find(
            c => c.symbol === tradeConfig.symbol
        );

        if (!currentPosition) {
            return true;
        }

        return this.isClosingOrder(currentPosition, tradeConfig);
    }

    isClosingOrder(currentPosition: FilledPositionConfig, tradeConfig: TradeConfig) {
        if (currentPosition.side === PositionDirection.long) {
            return tradeConfig.side === TradeDirection.sell;
        } else {
            return tradeConfig.side === TradeDirection.buy;
        }
    }

    tradeUpdater: EventEmitter = new EventEmitter();

    incrementDate() {
        this.currentDate = addMilliseconds(this.currentDate, this.updateIntervalMillis);
    }

    goToNextDay() {
        this.reset();
        this.currentDate = addHours(this.currentDate, 12);
        this.clock.tick(12 * 60 * 60 * 1000);
        this.tradeUpdater.emit("next_day", this.currentDate);
    }

    private reset() {
        this.strategyInstances = [];
        this.activeStrategyInstances = [];
        this.pendingTradeConfigs = [];
    }

    public async executeAndRecord() {
        if (!this.pendingTradeConfigs || !this.pendingTradeConfigs.length) {
            return [];
        }

        const newlyExecutedSymbols = [];

        for (const tradePlan of this.pendingTradeConfigs) {
            const symbol = tradePlan.symbol;
            const bars = this.replayBars[symbol];
            const instance = this.activeStrategyInstances.find(i => i.symbol === symbol);

            if (instance) {
                const entry = instance.entry;

                const barIndex = bars.findIndex(b => b.t > this.currentDate.getTime());

                const bar = bars[barIndex + 1];

                const position = this.executeSingleTrade(instance.stopPrice, bar, tradePlan, entry);

                if (position) {
                    this.currentPositionConfigs.push(position);
                    this.pendingTradeConfigs = this.pendingTradeConfigs.filter(
                        c => c.symbol !== symbol
                    );
                    this.activeStrategyInstances = this.activeStrategyInstances.filter(
                        s => s.symbol !== symbol
                    );
                    this.pastTradeConfigs.push({
                        ...tradePlan,
                        order: position.order
                    });
                    newlyExecutedSymbols.push(symbol);
                }
            } else {
                console.warn("cannot execute without no trade plan from strategy", tradePlan);
            }
        }

        return newlyExecutedSymbols;
    }

    private async findPositionConfigAndRebalance(tradeConfig: TradeConfig) {
        const position = this.currentPositionConfigs.find(p => p.symbol === tradeConfig.symbol);

        if (!position) {
            return null;
        }

        const bars = this.replayBars[position.symbol];
        const barIndex = bars.findIndex(b => b.t > this.currentDate.getTime());

        const bar = bars[barIndex + 1];

        const executedClose = this.executeSingleTrade(
            position.plannedStopPrice,
            bar,
            tradeConfig,
            position.plannedEntryPrice
        );

        if (!executedClose) {
            return null;
        }

        this.pastTradeConfigs.push({
            ...tradeConfig,
            order: executedClose.trades[executedClose.trades.length - 1].order
        });

        const isClosingOrder = this.isClosingOrder(position, tradeConfig);

        if (!isClosingOrder) {
            return executedClose;
        }

        const closesEntirePosition = position.quantity === 0;

        if (closesEntirePosition) {
            this.pastPositionConfigs.push(executedClose);

            this.currentPositionConfigs = this.currentPositionConfigs.filter(
                p => p.symbol !== tradeConfig.symbol
            );
        }

        return executedClose;
    }

    private executeSingleTrade(
        exit: number,
        bar: Bar,
        tradePlan: TradeConfig,
        plannedEntryPrice: number
    ): FilledPositionConfig | null {
        const symbol = tradePlan.symbol;
        const side =
            tradePlan.side === TradeDirection.buy
                ? PositionDirection.long
                : PositionDirection.short;

        // simulate tradePlan.price
        const position: FilledPositionConfig | undefined = this.currentPositionConfigs.find(
            p => p.symbol === tradePlan.symbol
        );

        if (!bar) {
            return null;
        }

        if (!position) {
            let unfilledPosition = {
                symbol: symbol,
                originalQuantity: tradePlan.quantity,
                hasHardStop: false,
                plannedEntryPrice,
                plannedStopPrice: exit,
                plannedQuantity: tradePlan.quantity,
                plannedRiskUnits: Math.abs(tradePlan.price - exit),
                side: side,
                quantity: tradePlan.quantity
            };

            if (bar.h > tradePlan.price && tradePlan.side === TradeDirection.buy) {
                const order = {
                    filledQuantity: tradePlan.quantity,
                    symbol: symbol,
                    averagePrice: tradePlan.price + Math.random() / 10,
                    status: OrderStatus.filled
                };

                return {
                    ...unfilledPosition,
                    order,
                    trades: [
                        {
                            ...tradePlan,
                            order
                        }
                    ]
                };
            } else if (bar.l < tradePlan.price && tradePlan.side === TradeDirection.sell) {
                const order = {
                    filledQuantity: tradePlan.quantity,
                    symbol: symbol,
                    averagePrice: tradePlan.price - Math.random() / 10,
                    status: OrderStatus.filled
                };

                return {
                    ...unfilledPosition,
                    order,
                    trades: [
                        {
                            ...tradePlan,
                            order
                        }
                    ]
                };
            }

            return null;
        }

        if (tradePlan.type === TradeType.market) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: bar.c + Math.random() / 10,
                status: OrderStatus.filled
            };

            position.trades.push({
                order,
                ...tradePlan
            });

            position.quantity -= order.filledQuantity;

            return position;
        } else {
            if (bar.h > tradePlan.price && tradePlan.side === TradeDirection.buy) {
                const order = {
                    filledQuantity: tradePlan.quantity,
                    symbol: symbol,
                    averagePrice: tradePlan.price + Math.random() / 10,
                    status: OrderStatus.filled
                };

                position.trades.push({
                    order,
                    ...tradePlan
                });
                position.quantity -= order.filledQuantity;

                return position;
            } else if (bar.l < tradePlan.price && tradePlan.side === TradeDirection.sell) {
                const order = {
                    filledQuantity: tradePlan.quantity,
                    symbol: symbol,
                    averagePrice: tradePlan.price - Math.random() / 10,
                    status: OrderStatus.filled
                };

                position.trades.push({
                    order,
                    ...tradePlan
                });
                position.quantity -= order.filledQuantity;

                return position;
            }
        }
        return null;
    }

    public async closeAndRebalance() {
        if (!this.currentPositionConfigs) {
            return [];
        }

        const symbols = this.currentPositionConfigs.map(p => p.symbol);

        const trades = [];

        for (const symbol of symbols) {
            const bars = this.replayBars[symbol];
            const barIndex = bars.findIndex(b => b.t > this.currentDate.getTime());
            const bar = bars[barIndex + 1];

            const position = this.currentPositionConfigs.find(p => p.symbol === symbol);

            if (!position) {
                console.warn("no position for ", symbol);
                continue;
            }
            if (!bar) {
                console.warn("no bar for ", symbol);
                continue;
            }

            trades.push(rebalancePosition(position, bar));
        }

        return trades;
    }
}
