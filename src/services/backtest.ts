import { EventEmitter } from "events";
import {
    addMilliseconds,
    startOfDay,
    addHours,
    differenceInMonths,
    addMonths,
    addBusinessDays,
    endOfMonth,
    isSameDay,
} from "date-fns";
import Sinon from "sinon";
import { TradeConfig, Bar } from "../data/data.model";
import {
    isMarketOpening,
    isAfterMarketClose,
    confirmMarketOpen,
    isMarketOpen,
} from "../util/market";
import {
    NarrowRangeBarStrategy,
    isTimeToCancelPendingOrbOrders,
} from "../strategy/narrowRangeBar";
import { TradeManagement } from "./tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { MockBroker } from "./mockExecution";
import { alpaca } from "../resources/alpaca";
import {
    Calendar,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import { getSimpleData, getData } from "../resources/stockData";
import { appendToCollectionFile } from "../util";

export class Backtester {
    currentDate: Date;
    managers: TradeManagement[] = [];
    strategyInstances: NarrowRangeBarStrategy[] = [];
    daysElapsed: number = 0;
    clock: Sinon.SinonFakeTimers;
    replayBars: {
        [index: string]: Bar[];
    } = {};
    todaysReplayBars: {
        [index: string]: Bar[];
    } = {};
    screenerDailyBars: {
        [index: string]: Bar[];
    } = {};
    screenerBars: {
        [index: string]: Bar[];
    } = {};
    todaysScreenerBars: {
        [index: string]: Bar[];
    } = {};
    calendar: Calendar[] = [];

    constructor(
        private broker: MockBroker,
        private updateIntervalMillis: number,
        private startDate: Date,
        private endDate: Date,
        private configuredSymbols: string[],
        private profitRatio: number = 1
    ) {
        this.currentDate = startDate;
        this.clock = Sinon.useFakeTimers(startDate);
    }

    async gatherDailyDataForSymbols(configuredSymbols: string[]) {
        for (const symbol of configuredSymbols) {
            try {
                const stockBars = this.screenerDailyBars[symbol];

                if (!stockBars || stockBars.length < 15) {
                    LOGGER.warn(
                        `No bars for ${symbol} on ${this.currentDate.toLocaleString()}`
                    );
                    continue;
                }

                const bars = stockBars.filter(
                    (b) => b.t < startOfDay(this.currentDate).getTime()
                );

                const nrbInstance = new NarrowRangeBarStrategy({
                    symbol,
                    bars,
                    broker: this.broker,
                });
                this.strategyInstances.push(nrbInstance);
            } catch (e) {
                LOGGER.error(e.message);
            }
        }
    }

    getTimeSeriesGenerator({ endDate }: { startDate: Date; endDate: Date }) {
        const context = this;

        return function* () {
            for (
                let i = context.currentDate.getTime();
                i < endDate.getTime();
                i += context.updateIntervalMillis
            ) {
                const prevDate = context.currentDate;

                yield prevDate;
                if (i % (context.updateIntervalMillis * 100) === 0) {
                    LOGGER.trace(prevDate);
                }
                i = context.currentDate.getTime();

                context.clock.tick(context.updateIntervalMillis);
                context.incrementDate();
            }
        };
    }

    async simulate(batchSize = 100, filename = "") {
        this.calendar = await alpaca.getCalendar({
            start: addBusinessDays(this.startDate, -3),
            end: this.endDate,
        });

        const batches = Backtester.getBatches(
            this.startDate,
            this.endDate,
            this.configuredSymbols,
            batchSize
        );

        for (const batch of batches) {
            this.replayBars = {};
            this.screenerDailyBars = {};
            this.screenerBars = {};
            this.todaysScreenerBars = {};
            this.currentDate = batch.startDate;
            this.clock.setSystemTime(this.currentDate);

            LOGGER.info(
                `Starting simulation for batch ${JSON.stringify(batch)}`
            );

            await this.batchSimulate(
                batch.startDate,
                batch.endDate,
                batch.symbols
            );

            if (filename) {
                try {
                    const pastPositionConfigs = this.broker.getPastPositions();
                    appendToCollectionFile(filename, pastPositionConfigs);
                    this.broker.reset();
                } catch (e) {
                    LOGGER.warn(`no positions so far`);
                }
            }
        }
    }

    async batchSimulate(startDate: Date, endDate: Date, symbols: string[]) {
        const dailyPromises = [];
        for (const symbol of symbols) {
            dailyPromises.push(
                getSimpleData(
                    symbol,
                    addBusinessDays(startDate, -25).getTime(),
                    false,
                    endDate.getTime()
                )
                    .then((data) => {
                        Object.assign(this.screenerDailyBars, {
                            [symbol]: data,
                        });
                    })
                    .catch(LOGGER.error)
            );
        }

        await Promise.all(dailyPromises);

        const replayPromises = [];

        for (const symbol of symbols) {
            replayPromises.push(
                getSimpleData(
                    symbol,
                    startDate.getTime(),
                    true,
                    endDate.getTime()
                )
                    .then((data) => {
                        Object.assign(this.replayBars, {
                            [symbol]: data.filter((b) => {
                                return confirmMarketOpen(this.calendar, b.t);
                            }),
                        });
                    })
                    .catch(LOGGER.error)
            );
        }

        await Promise.all(replayPromises);

        const screenerPromises = [];

        for (const symbol of symbols) {
            screenerPromises.push(
                getData(
                    symbol,
                    addBusinessDays(startDate, -3).getTime(),
                    "5 minutes",
                    endDate.getTime()
                ).then((data) => {
                    Object.assign(this.screenerBars, {
                        [symbol]: data.filter((b) => {
                            return confirmMarketOpen(this.calendar, b.t);
                        }),
                    });
                })
            );
        }

        await Promise.all(screenerPromises);

        const gen = this.getTimeSeriesGenerator({
            startDate,
            endDate,
        });

        for await (const {} of gen()) {
            if (
                confirmMarketOpen(this.calendar, this.currentDate.getTime()) &&
                isMarketOpen(this.currentDate.getTime())
            ) {
                /* Sinon.clock.restore(); */

                /* this.clock = Sinon.useFakeTimers(this.currentDate); */

                this.tradeUpdater.emit("interval_hit");

                const pendingTradeConfigs = await this.broker.getOrders({
                    status: "open",
                });

                const filteredInstances = this.strategyInstances.filter(
                    (i) =>
                        pendingTradeConfigs.every(
                            (c) => c.symbol !== i.symbol
                        ) &&
                        this.managers.every(
                            (m) =>
                                m.plan.symbol !== i.symbol ||
                                (m.filledPosition &&
                                    m.filledPosition.quantity === 0)
                        )
                );

                try {
                    const rebalancingPositionTrades = await this.closeAndRebalance();

                    for await (const tradeRebalance of rebalancingPositionTrades) {
                        if (tradeRebalance) {
                            LOGGER.debug(tradeRebalance);
                            await this.findPositionConfigAndRebalance(
                                tradeRebalance
                            );
                        }
                    }
                } catch (e) {
                    LOGGER.warn(e.message);
                }

                /* Sinon.clock.restore(); */

                const now = Date.now();

                /* this.clock = Sinon.useFakeTimers(this.currentDate); */

                for (const i of this.strategyInstances) {
                    i.screenForNarrowRangeBars();
                }

                /* Sinon.clock.restore(); */

                const now1 = Date.now();

                /* this.clock = Sinon.useFakeTimers(this.currentDate); */

                LOGGER.debug(`took  ${(now1 - now) / 1000}`);

                const potentialTradesToPlace = filteredInstances.map(
                    async (i) => {
                        if (!i.nrbs.length) {
                            return;
                        }
                        const todaysBars = this.getTodaysBars(i.symbol);

                        const bars = this.replayBars[i.symbol];

                        try {
                            const bar = await this.findOrFetchBarByDate(
                                this.currentDate.getTime(),
                                i.symbol,
                                bars,
                                0,
                                false,
                                false
                            );

                            if (!bar) {
                                LOGGER.warn(`no bar found`);
                                return;
                            }

                            const recentBars = todaysBars.filter(
                                (b) => b.t < this.currentDate.getTime()
                            );

                            return i.screenForEntry(
                                recentBars,
                                this.currentDate,
                                bar
                            );
                        } catch (e) {
                            LOGGER.warn(e);
                        }
                    }
                );

                /* Sinon.clock.restore(); */

                const now2 = Date.now();

                /* this.clock = Sinon.useFakeTimers(this.currentDate); */

                LOGGER.debug(`rebalancing took ${(now2 - now1) / 1000}`);

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

                /* Sinon.clock.restore(); */

                /* const text = `whole shebang took ${
                    (endMarket - startMarket) / 1000
                } seconds at ${this.currentDate.toLocaleString()}`;

                if (this.currentDate.getTime() % 300000 === 0) {
                    LOGGER.info(text);
                } else {
                    LOGGER.debug(text);
                } */

                /* this.clock = Sinon.useFakeTimers(this.currentDate); */
            }

            if (isMarketOpening(this.currentDate)) {
                this.tradeUpdater.emit("market_opening");
                await this.gatherDailyDataForSymbols(symbols);
            }

            if (isAfterMarketClose(this.currentDate)) {
                Object.keys(this.screenerBars).map((symbol) => {
                    this.screenerBars[symbol] = this.screenerBars[
                        symbol
                    ].filter(
                        (b) =>
                            b.t >
                            addBusinessDays(this.currentDate, -3).getTime()
                    );
                });
                Object.keys(this.replayBars).map((symbol) => {
                    this.replayBars[symbol] = this.replayBars[symbol].filter(
                        (b) =>
                            b.t >
                            addBusinessDays(this.currentDate, -3).getTime()
                    );
                });
                Object.keys(this.screenerDailyBars).map((symbol) => {
                    this.screenerDailyBars[symbol] = this.screenerDailyBars[
                        symbol
                    ].filter(
                        (b) =>
                            b.t >
                            addBusinessDays(this.currentDate, -25).getTime()
                    );
                });
                this.goToNextDay();
                LOGGER.info(
                    `Going to next day at ${this.currentDate.toLocaleString()}`
                );
            }
        }
    }

    async refreshBars(
        symbol: string,
        useLongerBars = false,
        time = this.currentDate.getTime()
    ): Promise<Bar> {
        LOGGER.warn(
            `Detected need to refresh bars at ${this.currentDate.toLocaleString()} for ${symbol}`
        );
        const minuteBars = await getSimpleData(
            symbol,
            addBusinessDays(this.currentDate, -1).getTime(),
            true,
            endOfMonth(this.currentDate).getTime()
        );
        const fifteenBars = await getData(
            symbol,
            addBusinessDays(this.currentDate, -1).getTime(),
            "5 minutes",
            endOfMonth(this.currentDate).getTime()
        );

        this.replayBars[symbol] = minuteBars;
        this.screenerBars[symbol] = fifteenBars;

        return this.findBarByDate(
            time,
            symbol,
            useLongerBars ? fifteenBars : minuteBars
        );
    }

    async findOrFetchBarByDate(
        time: number,
        symbol: string,
        bars: Bar[],
        offset?: number,
        useLongerBars = false,
        shouldForceAggregate = true
    ): Promise<Bar | null> {
        try {
            const bar = this.findBarByDate(
                time,
                symbol,
                bars,
                offset,
                shouldForceAggregate
            );

            return bar;
        } catch (e) {
            LOGGER.warn(e.message);
        }

        try {
            if (confirmMarketOpen(this.calendar, time)) {
                return this.refreshBars(symbol, useLongerBars, time);
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

        const barIndex = bars.findIndex((b) => b.t >= time);

        if (barIndex === -1) {
            const err = `couldnt find bar ${symbol} after retries at ${this.currentDate.toLocaleString()}`;
            throw new Error(err);
        }

        const offsetBarIndex = barIndex + offset;

        if (aggregate < 5 && shouldForceAggregate) {
            const aggregateBars = bars.slice(
                barIndex - 5 / aggregate,
                barIndex
            );

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
                    t: 0,
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
        this.currentDate = addMilliseconds(
            this.currentDate,
            this.updateIntervalMillis
        );
    }

    goToNextDay() {
        this.reset();
        this.currentDate = addHours(this.currentDate, 12);
        this.clock.tick(12 * 60 * 60 * 1000);
        this.tradeUpdater.emit("next_day", this.currentDate);
    }

    private reset() {
        this.managers = [];
        this.strategyInstances = [];
        this.broker.cancelAllOrders();
        this.todaysScreenerBars = {};
        this.todaysReplayBars = {};
    }

    public async executeAndRecord() {
        if (!this.managers.length) {
            return;
        }

        if (isTimeToCancelPendingOrbOrders(this.currentDate)) {
            return;
        }

        for (const manager of this.managers) {
            const symbol = manager.plan.symbol;
            const bars = this.getTodaysBars(symbol);
            const minuteBars = this.getTodaysReplayBars(symbol);

            if (manager.filledPosition) {
                continue;
            }

            const strategy = this.strategyInstances.find(
                (i) => i.symbol === symbol
            );
            const refreshBars = bars.filter(
                (b) =>
                    confirmMarketOpen(this.calendar, b.t) &&
                    isSameDay(this.currentDate, b.t) &&
                    b.t < this.currentDate.getTime()
            );
            const filteredMinuteBars = minuteBars.filter(
                (b) =>
                    confirmMarketOpen(this.calendar, b.t) &&
                    isSameDay(this.currentDate, b.t) &&
                    b.t < this.currentDate.getTime()
            );

            if (!bars) {
                LOGGER.error(`No bars for ${JSON.stringify(manager.plan)}`);
                continue;
            }
            const bar = filteredMinuteBars[filteredMinuteBars.length - 1];

            if (!bar) {
                LOGGER.error(`No bars for ${JSON.stringify(manager.plan)}`);
                continue;
            }

            const riskUnit =
                (manager.plan.plannedEntryPrice -
                    manager.plan.plannedStopPrice) /
                5;

            if (
                (manager.plan.side === PositionDirection.long &&
                    bar.l > manager.plan.plannedEntryPrice + riskUnit) ||
                (manager.plan.side === PositionDirection.short &&
                    bar.h < manager.plan.plannedEntryPrice + riskUnit)
            ) {
                continue;
            }
            const position = this.broker.executeTrade(bar, manager);

            if (position) {
                manager.filledPosition = position;
                this.managers = this.managers.filter(
                    (m) => m.plan.symbol !== position.symbol || m.filledPosition
                );
            }
        }

        return;
    }

    private async findPositionConfigAndRebalance(tradeConfig: TradeConfig) {
        const manager = this.managers.find(
            (p) =>
                p.plan.symbol === tradeConfig.symbol &&
                p.filledPosition &&
                p.filledPosition.quantity
        );

        if (
            !manager ||
            !manager.filledPosition ||
            !manager.filledPosition.quantity
        ) {
            return null;
        }

        const bars = this.replayBars[manager.plan.symbol];
        const bar = await this.findOrFetchBarByDate(
            this.currentDate.getTime(),
            tradeConfig.symbol,
            bars
        );

        const position = await this.broker.rebalanceHeldPosition(
            manager,
            bar,
            tradeConfig,
            this.currentDate
        );

        return position;
    }

    public async closeAndRebalance(): Promise<Array<TradeConfig | null>> {
        const currentPositionConfigs = await this.broker.getPositions();
        if (!currentPositionConfigs || !currentPositionConfigs.length) {
            return [];
        }

        const symbols = currentPositionConfigs.map((p) => p.symbol);

        const trades = [];

        for (const symbol of symbols) {
            const bars = this.replayBars[symbol];

            if (!bars) {
                LOGGER.warn(
                    `no bars found for date ${this.currentDate} for ${symbol}`
                );
                continue;
            }

            const bar = await this.findOrFetchBarByDate(
                this.currentDate.getTime(),
                symbol,
                bars
            );

            if (!bar) {
                LOGGER.warn(
                    `no bars found for date ${this.currentDate} for ${symbol}`
                );
                continue;
            }

            const manager = this.managers.find(
                (p) =>
                    p.plan.symbol === symbol &&
                    p.filledPosition &&
                    p.filledPosition.quantity
            );

            if (!manager) {
                LOGGER.warn("no trace for ", symbol);
                continue;
            }
            if (!bar) {
                LOGGER.warn(
                    `no bar for ${symbol} at ${this.currentDate.toISOString()}`
                );
                continue;
            }

            trades.push(
                await manager.rebalancePosition(bar, this.currentDate.getTime())
            );
        }

        return trades;
    }

    getTodaysBars(symbol: string) {
        let todaysBars = this.todaysScreenerBars[symbol];

        if (!todaysBars) {
            this.todaysScreenerBars[symbol] = this.screenerBars[symbol].filter(
                (b) => {
                    const sameDay = isSameDay(b.t, this.currentDate);
                    const marketOpen = confirmMarketOpen(this.calendar, b.t);
                    return sameDay && marketOpen;
                }
            );

            todaysBars = this.todaysScreenerBars[symbol];
        }

        return todaysBars;
    }

    getTodaysReplayBars(symbol: string) {
        let todaysBars = this.todaysReplayBars[symbol];

        if (!todaysBars) {
            this.todaysReplayBars[symbol] = this.replayBars[symbol].filter(
                (b) => {
                    const sameDay = isSameDay(b.t, this.currentDate);
                    const marketOpen = confirmMarketOpen(this.calendar, b.t);
                    return sameDay && marketOpen;
                }
            );

            todaysBars = this.todaysReplayBars[symbol];
        }

        return todaysBars;
    }

    static getBatches(
        startDate: Date,
        endDate: Date,
        symbols: string[],
        batchSize: number = 100
    ): BacktestBatch[] {
        const months = differenceInMonths(startDate, endDate);

        if (Math.abs(months) <= 1 && symbols.length < batchSize) {
            return [
                {
                    startDate,
                    endDate,
                    symbols,
                    batchId: 0,
                },
            ];
        }
        const batches = [];

        let batchStartDate = startDate;

        const durations = [];

        while (batchStartDate.getTime() < endDate.getTime()) {
            let batchedEndDate = addMonths(batchStartDate, 1);

            if (batchedEndDate.getTime() > endDate.getTime()) {
                batchedEndDate = endDate;
            }
            durations.push({
                startDate: batchStartDate,
                endDate: batchedEndDate,
            });
            batchStartDate = batchedEndDate;
        }

        for (const duration of durations) {
            for (let i = 0; i < symbols.length; i += batchSize) {
                batches.push({
                    startDate: duration.startDate,
                    endDate: duration.endDate,
                    symbols: symbols.slice(i, i + batchSize),
                    batchId: i,
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
