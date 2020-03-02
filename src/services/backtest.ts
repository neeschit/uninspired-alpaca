import {
    TradeConfig,
    PositionConfig,
    SymbolContainingConfig,
    DefaultDuration,
    PeriodType
} from "../data/data.model";
import { EventEmitter } from "events";
import { isAfter, addMilliseconds, isEqual, addDays, isSameDay, isWeekend } from "date-fns";
import {
    isMarketOpen,
    isMarketOpening,
    getMarketCloseMillis,
    isAfterMarketClose
} from "../util/market";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getBarsByDate } from "../data/bars";

export class Backtester {
    private cancelIntervalFn?: NodeJS.Timeout | undefined;
    currentDate: Date;
    pastTradeConfigs: TradeConfig[] = [];
    currentPositionConfigs: PositionConfig[] = [];
    pastPositionConfigs: PositionConfig[] = [];
    strategyInstances: NarrowRangeBarStrategy[] = [];
    activeStrategyInstances: NarrowRangeBarStrategy[] = [];
    private daysElapsed: number = 0;

    constructor(
        private updateIntervalMillis: number,
        private startDate: Date,
        private endDate: Date,
        private configuredSymbols: string[]
    ) {
        this.currentDate = startDate;
    }

    async screenSymbols() {
        const symbols = this.configuredSymbols.filter(symbol =>
            this.strategyInstances.every(i => i.symbol !== symbol)
        );

        const generator = this.getGenerator(symbols);

        for await (const { symbol, bars } of generator(this.currentDate)) {
            this.strategyInstances.push(
                new NarrowRangeBarStrategy({
                    period: 7,
                    symbol,
                    bars
                })
            );
        }
    }

    async getScreenedSymbols() {
        await this.screenSymbols();

        const shouldBeAdded = this.strategyInstances.filter(
            instance =>
                instance.checkIfFitsStrategy() &&
                this.activeStrategyInstances.every(i => i.symbol !== instance.symbol)
        );

        this.activeStrategyInstances.push(...shouldBeAdded);

        return this.activeStrategyInstances;
    }

    getTimeSeriesGenerator() {
        return function*() {};
    }

    getGenerator(symbols: string[]) {
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

    init() {
        this.cancelIntervalFn = setInterval(() => {
            const prevDate = this.currentDate;

            this.incrementDate();

            if (isMarketOpening(prevDate)) {
                this.tradeUpdater.emit("market_opening", prevDate);
            }

            if (isWeekend(prevDate)) {
                this.goToNextDay();
                this.tradeUpdater.emit("interval_hit", prevDate, this.currentDate);
            }

            if (isMarketOpen(prevDate)) {
                this.tradeUpdater.emit("interval_hit", prevDate, this.currentDate);
            } else if (isAfterMarketClose(prevDate)) {
                this.goToNextDay();
            }

            if (
                (isAfter(this.currentDate, this.endDate) ||
                    isEqual(this.currentDate, this.endDate)) &&
                this.cancelIntervalFn
            ) {
                console.log("clearing interval");
                clearInterval(this.cancelIntervalFn);
            }
        }, this.updateIntervalMillis);
    }

    public tradeUpdater: EventEmitter = new EventEmitter();

    recordOrderRequest(tradeConfig: TradeConfig) {
        if (!tradeConfig.quantity && !tradeConfig) {
            this.addToArray(tradeConfig, this.pastTradeConfigs);
        }
    }

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

    public incrementDate() {
        this.currentDate = addMilliseconds(this.currentDate, this.updateIntervalMillis);
    }

    public goToNextDay() {
        this.reset();
        this.currentDate = addDays(this.startDate, ++this.daysElapsed);
        this.tradeUpdater.emit("next_day", this.currentDate);
    }

    private reset() {
        this.strategyInstances = [];
    }

    public async handleTickUpdate() {
        return this.activeStrategyInstances.map(async i => await i.rebalance());
    }
}
