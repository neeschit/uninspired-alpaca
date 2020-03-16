import { EventEmitter } from "events";
import {
    addMilliseconds,
    addDays,
    startOfDay,
    addHours,
    differenceInMonths,
    addMonths
} from "date-fns";
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
import { LOGGER } from "../instrumentation/log";
import { formatInEasternTimeForDisplay } from "../util/date";

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

    async screenSymbols(configuredSymbols: string[]) {
        const symbols = configuredSymbols.filter(
            symbol =>
                this.strategyInstances.every(i => i.symbol !== symbol) &&
                this.currentPositionConfigs.every(p => p.symbol !== symbol)
        );

        for (const symbol of symbols) {
            try {
                const stockBars = this.screenerBars[symbol];

                if (!stockBars) {
                    LOGGER.warn(`No bars for ${symbol} on ${this.currentDate.toLocaleString()}`);
                    continue;
                }

                const bars = stockBars.filter(b => b.t < startOfDay(this.currentDate).getTime());
                const nrbInstance = new NarrowRangeBarStrategy({
                    period: 7,
                    symbol,
                    bars
                });
                this.strategyInstances.push(nrbInstance);
            } catch (e) {
                LOGGER.error(e);
            }
        }

        const shouldBeAdded = this.strategyInstances.filter(
            instance =>
                instance.checkIfFitsStrategy() &&
                this.activeStrategyInstances.every(i => i.symbol !== instance.symbol)
        );

        this.activeStrategyInstances.push(...shouldBeAdded);
    }

    async getScreenedSymbols(symbols: string[]) {
        await this.screenSymbols(symbols);

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

    getTimeSeriesGenerator({ startDate, endDate }: { startDate: Date; endDate: Date }) {
        const context = this;

        return function*() {
            for (
                let i = context.currentDate.getTime();
                i < endDate.getTime();
                i += context.updateIntervalMillis
            ) {
                const prevDate = context.currentDate;

                context.clock.tick(context.updateIntervalMillis);

                yield prevDate;
                if (i % (context.updateIntervalMillis * 100) === 0) {
                    LOGGER.debug(prevDate);
                }
                LOGGER.debug("pending: " + context.pendingTradeConfigs);
                LOGGER.debug("pending pos: " + context.strategyInstances.map(c => c.symbol));
                LOGGER.debug("past pos: " + context.pastPositionConfigs.map(c => c.symbol));
                LOGGER.debug("pending pos: " + JSON.stringify(context.pendingTradeConfigs));
                LOGGER.debug("active: " + context.currentPositionConfigs.map(c => c.symbol));
                LOGGER.debug("active pos: " + context.activeStrategyInstances.map(c => c.symbol));
                i = context.currentDate.getTime();

                context.incrementDate();
            }
        };
    }

    async batchSimulate(startDate: Date, endDate: Date, symbols: string[]) {
        const replayBars = this.getReplayDataGenerator(
            symbols,
            this.updateIntervalMillis === 60000 ? DefaultDuration.one : DefaultDuration.five,
            PeriodType.minute,
            startDate,
            endDate
        );

        for await (const bar of replayBars()) {
            Object.assign(this.replayBars, {
                [bar.symbol]: bar.bars
            });
        }

        const screenerBars = this.getReplayDataGenerator(
            symbols,
            DefaultDuration.one,
            PeriodType.day,
            addDays(startDate, -150),
            addDays(endDate, 1)
        );

        for await (const bar of screenerBars()) {
            Object.assign(this.screenerBars, {
                [bar.symbol]: bar.bars
            });
        }

        const gen = this.getTimeSeriesGenerator({
            startDate,
            endDate
        });

        for await (const {} of gen()) {
            if (isMarketOpen(this.currentDate)) {
                this.tradeUpdater.emit("interval_hit");

                const filteredInstances = this.activeStrategyInstances.filter(i => {
                    return this.pendingTradeConfigs.every(c => c.symbol !== i.symbol);
                });

                const rebalancingPositionTrades = await this.closeAndRebalance(startDate, endDate);

                for await (const tradeRebalance of rebalancingPositionTrades) {
                    if (tradeRebalance) {
                        LOGGER.debug(tradeRebalance);
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
                            LOGGER.debug(promiseResult);
                            this.pendingTradeConfigs.push(promiseResult);
                        } else {
                            LOGGER.warn("cannot verify " + JSON.stringify(promiseResult));
                        }
                    }
                }

                const newlyExecutedSymbols = await this.executeAndRecord();
            }
            if (isMarketOpening(this.currentDate)) {
                this.tradeUpdater.emit("market_opening");
                await this.getScreenedSymbols(symbols);
            }

            if (isAfterMarketClose(this.currentDate)) {
                this.goToNextDay();
            }
        }
    }

    async simulate(batchSize = 100) {
        const batches = Backtester.getBatches(
            this.startDate,
            this.endDate,
            this.configuredSymbols,
            batchSize
        );

        const currentPositionConfigs: FilledPositionConfig[][] = [];

        for (const batch of batches) {
            this.currentDate = batch.startDate;
            this.replayBars = {};
            this.currentPositionConfigs = currentPositionConfigs[batch.batchId] || [];
            this.clock.setSystemTime(this.currentDate);

            LOGGER.info(`Starting simulation for batch ${JSON.stringify(batch)}`);

            await this.batchSimulate(batch.startDate, batch.endDate, batch.symbols);

            currentPositionConfigs[batch.batchId] = this.currentPositionConfigs;
        }
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

            if (!bars) {
                LOGGER.error(`No bars for ${JSON.stringify(tradePlan)}`);
                continue;
            }

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
                        order: position.order,
                        estString: formatInEasternTimeForDisplay(tradePlan.t)
                    });
                    newlyExecutedSymbols.push(symbol);
                }
            } else {
                LOGGER.warn("cannot execute without no trade plan from strategy", tradePlan);
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

        tradePlan.estString = formatInEasternTimeForDisplay(tradePlan.t);

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

    public async closeAndRebalance(startDate: Date, endDate: Date) {
        if (!this.currentPositionConfigs) {
            return [];
        }

        const symbols = this.currentPositionConfigs.map(p => p.symbol);

        const trades = [];

        for (const symbol of symbols) {
            const bars = this.replayBars[symbol];

            if (!bars) {
                LOGGER.warn(`no bars found for date ${this.currentDate} for ${symbol}`);
                continue;
            }

            let barIndex = bars.findIndex(b => b.t > this.currentDate.getTime());

            if (barIndex === -1) {
                LOGGER.warn(
                    `no bars found for date ${this.currentDate.toLocaleString()} for ${symbol}`
                );
                const bars = await getBarsByDate(
                    symbol,
                    addDays(this.currentDate, -1),
                    endDate,
                    this.updateIntervalMillis === 60000
                        ? DefaultDuration.one
                        : DefaultDuration.five,
                    PeriodType.minute
                );

                this.replayBars[symbol].push(...bars);

                barIndex = bars.findIndex(b => b.t > this.currentDate.getTime());

                if (barIndex === -1) {
                    throw new Error("couldnt find bar");
                }
            }

            const bar = bars[barIndex + 1];

            const position = this.currentPositionConfigs.find(p => p.symbol === symbol);

            if (!position) {
                LOGGER.warn("no position for ", symbol);
                continue;
            }
            if (!bar) {
                LOGGER.warn(`no bar for ${symbol} at ${this.currentDate.toISOString()}`);
                continue;
            }

            trades.push(rebalancePosition(position, bar));
        }

        return trades;
    }

    static getBatches(
        startDate: Date,
        endDate: Date,
        symbols: string[],
        batchSize: number = 100
    ): BacktestBatch[] {
        const months = differenceInMonths(startDate, endDate);

        if (Math.abs(months) < 5 && symbols.length < batchSize) {
            return [
                {
                    startDate,
                    endDate,
                    symbols,
                    batchId: 0
                }
            ];
        }
        const batches = [];

        let batchStartDate = startDate;

        const durations = [];

        while (batchStartDate.getTime() < endDate.getTime()) {
            let batchedEndDate = addMonths(batchStartDate, 6);

            if (batchedEndDate.getTime() > endDate.getTime()) {
                batchedEndDate = endDate;
            }
            durations.push({
                startDate: batchStartDate,
                endDate: batchedEndDate
            });
            batchStartDate = batchedEndDate;
        }

        for (const duration of durations) {
            for (let i = 0; i < symbols.length; i += batchSize) {
                batches.push({
                    startDate: duration.startDate,
                    endDate: duration.endDate,
                    symbols: symbols.slice(i, i + batchSize),
                    batchId: i
                });
            }
        }

        return batches;
    }
}

export interface BacktestBatch {
    startDate: Date;
    endDate: Date;
    symbols: string[];
    batchId: number;
}
