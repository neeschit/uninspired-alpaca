import { EventEmitter } from "events";
import {
    isAfter,
    addMilliseconds,
    isEqual,
    addDays,
    isSameDay,
    isWeekend
} from "date-fns";
import Sinon from 'sinon';
import {
    TradeConfig,
    PositionConfig,
    SymbolContainingConfig,
    DefaultDuration,
    PeriodType
} from "../data/data.model";
import {
    isMarketOpen,
    isMarketOpening,
    isAfterMarketClose
} from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";


export class Backtester {
    private cancelIntervalFn?: NodeJS.Timeout | undefined;
    currentDate: Date;
    pastTradeConfigs: TradeConfig[] = [];
    pendingTradeConfigs: TradeConfig[] = [];
    currentPositionConfigs: PositionConfig[] = [];
    pastPositionConfigs: PositionConfig[] = [];
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

    getBarDataGenerator(symbols: string[]) {
        return async function*(currentDate: Date) {
            for (const symbol of symbols) {
                const bars = await getBarsByDate(
                    symbol,
                    addDays(currentDate, -150),
                    currentDate,
                    DefaultDuration.one,
                    PeriodType.day
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

                context.incrementDate();
            }
        };
    }

    async simulate() {
        const gen = this.getTimeSeriesGenerator();

        for await (const date of gen()) {
            if (isMarketOpen(this.currentDate)) {
                this.tradeUpdater.emit("interval_hit");

                this.executeAndRecord();

                const filteredInstances = this.activeStrategyInstances
                    .filter(i => {
                        return this.pendingTradeConfigs.every(
                            c => c.symbol !== i.symbol
                        )
                    });

                const promises = filteredInstances.map(i => i.rebalance(this.currentDate));

                for await(const promiseResult of promises) {
                    if (promiseResult) {
                        this.pendingTradeConfigs.push(promiseResult);
                    }
                }
            }
            if (isMarketOpening(this.currentDate)) {
                this.tradeUpdater.emit('market_opening');
                await this.getScreenedSymbols();
            }
        }
    }

    tradeUpdater: EventEmitter = new EventEmitter();

    recordPositionUpdate(positionConfig: PositionConfig) {
        if (!positionConfig.quantity) {
            this.addToArray(positionConfig, this.pastPositionConfigs);
            return;
        }

        this.addToArray(positionConfig, this.currentPositionConfigs);
    }

    private addToArray<X extends SymbolContainingConfig>(item: X, array: X[]) {
        const index = array.findIndex(val => val.symbol);

        if (!index) {
            array.push(item);
        } else {
            array[index] = item;
        }
    }

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
        
    }
}
