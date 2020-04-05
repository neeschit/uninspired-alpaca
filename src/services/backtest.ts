import { EventEmitter } from "events";
import {
    addMilliseconds,
    addDays,
    startOfDay,
    addHours,
    differenceInMonths,
    addMonths,
    set
} from "date-fns";
import Sinon from "sinon";
import {
    TradeConfig,
    DefaultDuration,
    PeriodType,
    FilledPositionConfig,
    Bar
} from "../data/data.model";
import { isMarketOpening, isAfterMarketClose, confirmMarketOpen } from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";
import { TradeManagement } from "./tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { executeSingleTrade, liquidatePosition, MockBroker } from "./mockExecution";
import { getSymbolDataGenerator } from "../resources/polygon";
import { alpaca } from "../resources/alpaca";
import { getDetailedPerformanceReport } from "./performance";
import { Calendar } from "@alpacahq/alpaca-trade-api";

export class Backtester {
    currentDate: Date;
    managers: TradeManagement[] = [];
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
        private broker: MockBroker,
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
        const positions = await this.broker.getPositions();
        const symbols = configuredSymbols.filter(
            symbol =>
                this.strategyInstances.every(i => i.symbol !== symbol) &&
                positions.every(p => p.symbol !== symbol)
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
                    period: this.period,
                    symbol,
                    bars,
                    useSimpleRange: this.useSimpleRange,
                    counterTrend: this.counterTrend,
                    broker: this.broker
                });
                this.strategyInstances.push(nrbInstance);
            } catch (e) {
                LOGGER.error(e.message);
            }
        }

        const shouldBeAdded = this.strategyInstances.filter(
            instance =>
                instance.checkIfFitsStrategy(this.minMaxRatio > 1) &&
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
            this.broker.setPositions(currentPositionConfigs[batch.batchId] || []);
            this.clock.setSystemTime(this.currentDate);

            LOGGER.info(`Starting simulation for batch ${JSON.stringify(batch)}`);

            await this.batchSimulate(batch.startDate, batch.endDate, batch.symbols);

            if (logPerformance) {
                try {
                    const pastPositionConfigs = this.broker.getPastPositions().slice(pastLength);
                    const perfReport = getDetailedPerformanceReport(pastPositionConfigs);
                    pastLength = pastPositionConfigs.length;
                    LOGGER.info(`performance so far ${JSON.stringify(perfReport)}`);
                } catch (e) {
                    LOGGER.warn(`no positions so far`);
                }
            }

            currentPositionConfigs[batch.batchId] = await this.broker.getCurrentPositions();
        }
    }

    async batchSimulate(startDate: Date, endDate: Date, symbols: string[]) {
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

        /* for (const symbol of symbols) {
            const cacheFileName = getCacheDataName(symbol, DefaultDuration.one, PeriodType.day);
            Object.assign(this.screenerBars, {
                [symbol]: JSON.parse(readFileSync(cacheFileName).toString())
            });
        } */

        const gen = this.getTimeSeriesGenerator({
            startDate,
            endDate
        });

        for await (const {} of gen()) {
            if (confirmMarketOpen(this.calendar, this.currentDate.getTime())) {
                this.tradeUpdater.emit("interval_hit");

                const pendingTradeConfigs = await this.broker.getOrders({
                    status: "open"
                });

                const filteredInstances = this.activeStrategyInstances.filter(i => {
                    return pendingTradeConfigs.every(c => c.symbol !== i.symbol);
                });

                try {
                    const rebalancingPositionTrades = await this.closeAndRebalance();

                    for await (const tradeRebalance of rebalancingPositionTrades) {
                        if (tradeRebalance) {
                            LOGGER.debug(tradeRebalance);
                            await this.findPositionConfigAndRebalance(tradeRebalance);
                        }
                    }
                } catch (e) {
                    LOGGER.warn(e.message);
                }

                const potentialTradesToPlace = filteredInstances.map(async i => {
                    const bars = this.replayBars[i.symbol];

                    try {
                        let offset = 0;
                        let bar = await this.findOrFetchBarByDate(
                            set(this.currentDate.getTime(), i.entryEpochTrigger).getTime(),
                            i.symbol,
                            bars,
                            offset
                        );

                        if (!bar) {
                            LOGGER.warn(`no bar found`);
                            return;
                        }

                        if (bar.v < 25000) {
                            offset++;
                            bar = await this.findOrFetchBarByDate(
                                set(this.currentDate.getTime(), i.entryEpochTrigger).getTime(),
                                i.symbol,
                                bars,
                                offset
                            );
                        }

                        if (!bar) {
                            throw new Error("no bar found");
                        }

                        const nextBar = await this.findOrFetchBarByDate(
                            set(this.currentDate.getTime(), i.entryEpochTrigger).getTime(),
                            i.symbol,
                            bars,
                            offset,
                            false
                        );

                        if (!nextBar) {
                            throw new Error("Shoulda found the next bar for " + i.symbol);
                        }

                        return i.rebalance(nextBar, bar, this.currentDate);
                    } catch (e) {
                        LOGGER.warn(e);
                    }
                });

                for await (const trade of potentialTradesToPlace) {
                    if (trade) {
                        const manager = new TradeManagement(
                            trade.config,
                            trade.plan,
                            this.profitRatio,
                            this.broker
                        );

                        this.managers.push(manager);
                    }
                }

                await this.executeAndRecord();
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

    async findOrFetchBarByDate(
        time: number,
        symbol: string,
        bars: Bar[],
        offset?: number,
        shouldForceAggregate = true
    ): Promise<Bar | null> {
        try {
            const bar = this.findBarByDate(time, symbol, bars, offset, shouldForceAggregate);

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

    findBarByDate(
        time: number,
        symbol: string,
        bars: Bar[],
        offset = 0,
        shouldForceAggregate = true
    ): Bar {
        const aggregate = this.updateIntervalMillis / 60000;

        const barIndex = bars.findIndex(b => b.t >= time);

        if (barIndex === -1) {
            const err = `couldnt find bar ${symbol} after retries at ${this.currentDate.toLocaleString()}`;
            throw new Error(err);
        }

        const offsetBarIndex = barIndex + offset;

        if (aggregate < 5 && shouldForceAggregate) {
            const aggregateBars = bars.slice(barIndex - 5 / aggregate, barIndex);

            return aggregateBars.reduce(
                (aggregatedBar, currentBar) => {
                    aggregatedBar.v += currentBar.v;

                    if (!aggregatedBar.t) {
                        aggregatedBar.c = currentBar.c;
                        aggregatedBar.o = currentBar.o;
                    } else if (currentBar.t > aggregatedBar.t) {
                        aggregatedBar.c = currentBar.c;
                    } else if (currentBar.t < aggregatedBar.t) {
                        aggregatedBar.o = currentBar.o;
                    }

                    if (currentBar.h > aggregatedBar.h) {
                        aggregatedBar.h = currentBar.h;
                    }

                    if (currentBar.l < aggregatedBar.l) {
                        aggregatedBar.l = currentBar.l;
                    }

                    aggregatedBar.t = currentBar.t;

                    return aggregatedBar;
                },
                {
                    o: 0,
                    h: 0,
                    l: Number.MAX_SAFE_INTEGER,
                    c: 0,
                    v: 0,
                    t: 0
                }
            );
        } else {
            const bar = bars[offsetBarIndex];

            if (Math.abs(bar.t - time) > this.updateIntervalMillis * 60) {
                const err = new Error(
                    `wrong bar ${symbol} at ${this.currentDate.toLocaleString()}, found ${new Date(
                        bar.t
                    ).toLocaleString()} instead`
                );
                throw err;
            }

            return bar;
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
        this.managers = [];
        this.broker.cancelAllOrders();
    }

    public async executeAndRecord() {
        if (!this.managers.length) {
            return [];
        }

        for (const manager of this.managers) {
            const symbol = manager.plan.symbol;
            const bars = this.replayBars[symbol];

            if (manager.filledPosition) {
                return null;
            }

            if (!bars) {
                LOGGER.error(`No bars for ${JSON.stringify(manager.plan)}`);
                continue;
            }
            const bar = await this.findOrFetchBarByDate(this.currentDate.getTime(), symbol, bars);

            if (!bar) {
                LOGGER.error(`No bars for ${JSON.stringify(manager.plan)}`);
                continue;
            }

            const position = this.broker.executeTrade(bar, manager);

            if (position) {
                manager.filledPosition = position;
                this.activeStrategyInstances = this.activeStrategyInstances.filter(
                    s => s.symbol !== symbol
                );
                this.managers = this.managers.filter(
                    m => m.plan.symbol !== position.symbol || m.filledPosition
                );
            }
        }

        return [];
    }

    private async findPositionConfigAndRebalance(tradeConfig: TradeConfig) {
        const manager = this.managers.find(p => p.position.symbol === tradeConfig.symbol);

        if (!manager || !manager.filledPosition) {
            return null;
        }

        const bars = this.replayBars[manager.plan.symbol];
        const bar = await this.findOrFetchBarByDate(
            this.currentDate.getTime(),
            tradeConfig.symbol,
            bars
        );

        return this.broker.rebalanceHeldPosition(manager, bar, this.currentDate);
    }

    public async closeAndRebalance(): Promise<Array<TradeConfig | null>> {
        const currentPositionConfigs = await this.broker.getPositions();
        if (!currentPositionConfigs || !currentPositionConfigs.length) {
            return [];
        }

        const symbols = currentPositionConfigs.map(p => p.symbol);

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

            const manager = this.managers.find(p => p.plan.symbol === symbol);

            if (!manager) {
                LOGGER.warn("no trace for ", symbol);
                continue;
            }
            if (!bar) {
                LOGGER.warn(`no bar for ${symbol} at ${this.currentDate.toISOString()}`);
                continue;
            }

            trades.push(await manager.rebalancePosition(bar, this.currentDate.getTime()));
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
