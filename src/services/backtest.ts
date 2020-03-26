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
    TradeDirection,
    PositionDirection,
    Bar,
    FilledTradeConfig
} from "../data/data.model";
import {
    isMarketOpen,
    isMarketOpening,
    isAfterMarketClose,
    confirmMarketOpen
} from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";
import { rebalancePosition } from "./tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { formatInEasternTimeForDisplay } from "../util/date";
import { executeSingleTrade } from "./mockExecution";
import { getSymbolDataGenerator } from "../connection/polygon";
import { alpaca } from "../connection/alpaca";
import { getDetailedPerformanceReport } from "./performance";
import { Calendar } from "@alpacahq/alpaca-trade-api";

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
    calendar: Calendar[] = [];

    constructor(
        private updateIntervalMillis: number,
        private startDate: Date,
        private endDate: Date,
        private configuredSymbols: string[],
        private profitRatio: number = 1,
        private minMaxRatio: number = 1,
        private useSimpleRange: boolean = false,
        private counterTrend: boolean = false,
        private period: number = 7
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

                if (!stockBars || stockBars.length < 15) {
                    LOGGER.warn(`No bars for ${symbol} on ${this.currentDate.toLocaleString()}`);
                    continue;
                }

                const bars = stockBars.filter(b => b.t < startOfDay(this.currentDate).getTime());
                const nrbInstance = new NarrowRangeBarStrategy({
                    period: 7,
                    symbol,
                    bars,
                    useSimpleRange: this.useSimpleRange,
                    counterTrend: this.counterTrend
                });
                this.strategyInstances.push(nrbInstance);
            } catch (e) {
                LOGGER.error(e.message);
            }
        }

        const shouldBeAdded = this.strategyInstances.filter(
            instance =>
                instance.checkIfFitsStrategy(this.profitRatio, this.minMaxRatio > 1) &&
                this.activeStrategyInstances.every(i => i.symbol !== instance.symbol)
        );

        this.activeStrategyInstances.push(...shouldBeAdded);
    }

    async getScreenedSymbols(symbols: string[]) {
        await this.screenSymbols(symbols);

        return this.activeStrategyInstances;
    }

    getTimeSeriesGenerator({ endDate }: { startDate: Date; endDate: Date }) {
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
                    LOGGER.trace(prevDate);
                }
                LOGGER.trace("pending: " + context.pendingTradeConfigs);
                LOGGER.trace("pending pos: " + context.strategyInstances.map(c => c.symbol));
                LOGGER.trace("past pos: " + context.pastPositionConfigs.map(c => c.symbol));
                LOGGER.trace("pending pos: " + JSON.stringify(context.pendingTradeConfigs));
                LOGGER.trace("active: " + context.currentPositionConfigs.map(c => c.symbol));
                LOGGER.trace("active pos: " + context.activeStrategyInstances.map(c => c.symbol));
                i = context.currentDate.getTime();

                context.incrementDate();
            }
        };
    }

    async simulate(batchSize = 100, logPerformance = true) {
        this.calendar = await alpaca.getCalendar({
            start: this.startDate,
            end: this.endDate
        });

        const batches = Backtester.getBatches(
            this.startDate,
            this.endDate,
            this.configuredSymbols,
            batchSize
        );

        const currentPositionConfigs: FilledPositionConfig[][] = [];

        let pastLength = 0;

        for (const batch of batches) {
            this.currentDate = batch.startDate;
            this.replayBars = {};
            this.currentPositionConfigs = currentPositionConfigs[batch.batchId] || [];
            this.clock.setSystemTime(this.currentDate);

            LOGGER.info(`Starting simulation for batch ${JSON.stringify(batch)}`);

            await this.batchSimulate(batch.startDate, batch.endDate, batch.symbols);

            if (logPerformance) {
                try {
                    const perfReport = getDetailedPerformanceReport(
                        this.pastPositionConfigs.slice(pastLength)
                    );
                    pastLength = this.pastPositionConfigs.length;
                    LOGGER.info(`performance so far ${JSON.stringify(perfReport)}`);
                } catch (e) {
                    LOGGER.warn(`no positions so far`);
                }
            }

            currentPositionConfigs[batch.batchId] = this.currentPositionConfigs;
        }
    }

    async batchSimulate(startDate: Date, endDate: Date, symbols: string[]) {
        const replayBars = getSymbolDataGenerator(
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

        const screenerBars = getSymbolDataGenerator(
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
            if (confirmMarketOpen(this.calendar, this.currentDate.getTime())) {
                this.tradeUpdater.emit("interval_hit");

                const filteredInstances = this.activeStrategyInstances.filter(i => {
                    return this.pendingTradeConfigs.every(c => c.symbol !== i.symbol);
                });

                try {
                    const rebalancingPositionTrades = await this.closeAndRebalance(endDate);

                    for await (const tradeRebalance of rebalancingPositionTrades) {
                        if (tradeRebalance) {
                            LOGGER.debug(tradeRebalance);
                            if (this.validateTrade(tradeRebalance)) {
                                await this.findPositionConfigAndRebalance(tradeRebalance);
                            }
                        }
                    }
                } catch (e) {
                    LOGGER.warn(e.message);
                }

                const potentialTradesToPlace = filteredInstances.map(async i => {
                    const bars = this.replayBars[i.symbol];

                    try {
                        let bar = await this.findOrFetchBarByDate(
                            this.currentDate.getTime(),
                            i.symbol,
                            bars
                        );

                        if (!bar) {
                            LOGGER.warn(`no bar found`);
                            return;
                        }

                        return i.rebalance(bar, this.currentDate);
                    } catch (e) {
                        LOGGER.warn(e);
                    }
                });

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

    async refreshBars(symbol: string, time = this.currentDate.getTime()): Promise<Bar> {
        LOGGER.warn(
            `Detected need to refresh bars at ${this.currentDate.toLocaleString()} for ${symbol}`
        );
        const bars = await getBarsByDate(
            symbol,
            addDays(this.currentDate, -1),
            this.endDate,
            this.updateIntervalMillis === 60000 ? DefaultDuration.one : DefaultDuration.five,
            PeriodType.minute
        );

        this.replayBars[symbol] = bars;

        return this.findBarByDate(time, symbol, bars);
    }

    async findOrFetchBarByDate(time: number, symbol: string, bars: Bar[]): Promise<Bar | null> {
        try {
            const bar = this.findBarByDate(time, symbol, bars);

            return bar;
        } catch (e) {
            LOGGER.warn(e.message);
        }

        try {
            if (confirmMarketOpen(this.calendar, time)) {
                return this.refreshBars(symbol, time);
            }
        } catch (e) {
            LOGGER.warn(e.message);
        }

        return null;
    }

    findBarByDate(time: number, symbol: string, bars: Bar[]): Bar {
        const barIndex = bars.findIndex(b => b.t >= time);

        if (barIndex === -1) {
            const err = `couldnt find bar ${symbol} after retries at ${this.currentDate.toLocaleString()}`;
            throw new Error(err);
        }

        const bar = bars[barIndex];

        if (Math.abs(bar.t - time) > this.updateIntervalMillis * 60) {
            const err = new Error(
                `wrong bar ${symbol} at ${this.currentDate.toLocaleString()}, found ${new Date(
                    bar.t
                ).toLocaleString()} insstead`
            );
            throw err;
        }

        return bar;
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

                const bar = await this.findOrFetchBarByDate(
                    this.currentDate.getTime(),
                    symbol,
                    bars
                );

                if (!bar) {
                    LOGGER.error(`No bars for ${JSON.stringify(tradePlan)}`);
                    continue;
                }

                const position = executeSingleTrade(
                    instance.stopPrice,
                    bar,
                    tradePlan,
                    entry,
                    this.currentPositionConfigs
                );

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
        const bar = await this.findOrFetchBarByDate(
            this.currentDate.getTime(),
            tradeConfig.symbol,
            bars
        );

        if (!bar) {
            LOGGER.error(
                `Couldn't find bar when trying to rebalance on ${this.currentDate.toLocaleString()} for ${
                    position.symbol
                }`
            );

            return null;
        }

        const executedClose = executeSingleTrade(
            position.plannedStopPrice,
            bar,
            tradeConfig,
            position.plannedEntryPrice,
            this.currentPositionConfigs
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

    public async closeAndRebalance(endDate: Date) {
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

            const bar = await this.findOrFetchBarByDate(this.currentDate.getTime(), symbol, bars);

            if (!bar) {
                LOGGER.warn(`no bars found for date ${this.currentDate} for ${symbol}`);
                continue;
            }

            const position = this.currentPositionConfigs.find(p => p.symbol === symbol);

            if (!position) {
                LOGGER.warn("no position for ", symbol);
                continue;
            }
            if (!bar) {
                LOGGER.warn(`no bar for ${symbol} at ${this.currentDate.toISOString()}`);
                continue;
            }

            trades.push(
                rebalancePosition(position, bar, this.profitRatio, this.currentDate.getTime())
            );
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
