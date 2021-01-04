import { Calendar } from "@neeschit/alpaca-trade-api";
import {
    addBusinessDays,
    differenceInDays,
    format,
    formatISO,
    parseISO,
    startOfDay,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { MarketTimezone } from "../core-utils/data/data.model";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { SimulationStrategy } from "./simulation.strategy";
import {
    DATE_FORMAT,
    FIFTEEN_MINUTES,
    isAfterMarketClose,
    isBeforeMarketOpening,
    isMarketClosing,
    isMarketOpen,
    isMarketOpening,
    isPremarket,
} from "./timing.util";
import { LOGGER } from "../core-utils/instrumentation/log";
import { ClosedMockPosition, MockBrokerage } from "./mockBrokerage";
import { getPerformance } from "./perfomance";
import { open } from "fs-extra";

export type SimulationImpl = new (...args: any[]) => SimulationStrategy;

export const mergeResults = (
    results: BacktestBatchResult[],
    batchResult: BacktestBatchResult
) => {
    const resultToAddTo = results.find(
        (r) => r.startDate === batchResult.startDate
    );
    if (resultToAddTo) {
        resultToAddTo.positions[batchResult.startDate] =
            resultToAddTo.positions[batchResult.startDate] &&
            resultToAddTo.positions[batchResult.startDate].concat(
                batchResult.positions[batchResult.startDate]
            );
        resultToAddTo.watchlist[batchResult.startDate] =
            resultToAddTo.watchlist[batchResult.startDate] &&
            resultToAddTo.watchlist[batchResult.startDate].concat(
                batchResult.watchlist[batchResult.startDate]
            );
    } else {
        results.push(batchResult);
    }
};

export interface SimulationResult {
    totalPnl: number;
    maxLeverage: number;
    results: AggregatedBacktestBatchResult[];
}

export class Simulator {
    private readonly updateInterval = 60000;

    private strategies: { [index: string]: SimulationStrategy } = {};

    async run(
        batches: BacktestBatch[],
        strategy: SimulationImpl
    ): Promise<SimulationResult> {
        const results: BacktestBatchResult[] = [];
        for await (const batchResult of this.syncToAsyncIterable(
            batches,
            strategy
        )) {
            mergeResults(results, batchResult);
        }

        const filteredResults: AggregatedBacktestBatchResult[] = results
            .filter((r) => {
                return r.positions[r.startDate];
            })
            .map((r) => {
                return {
                    startDate: r.startDate,
                    endDate: r.endDate,
                    maxLeverage: r.maxLeverage,
                    positions: r.positions[r.startDate],
                    watchlist: r.watchlist[r.startDate],
                };
            });

        const totalPnl = getPerformance(filteredResults);

        const maxLeverage = filteredResults.reduce((leverage, result) => {
            leverage = Math.max(leverage, result.maxLeverage);
            return leverage;
        }, 0);

        return {
            totalPnl,
            results: filteredResults,
            maxLeverage,
        };
    }

    private async *syncToAsyncIterable(
        batches: BacktestBatch[],
        strategy: SimulationImpl
    ) {
        for (const batch of batches) {
            const start = parseISO(batch.startDate);
            const end = parseISO(batch.endDate);
            const calendar = await getCalendar(start, end);
            LOGGER.info(`running batch ${JSON.stringify(batch)}`);
            const result = await this.executeBatch(batch, calendar, strategy);
            yield result;
        }
    }

    private async executeBatch(
        batch: BacktestBatch,
        calendar: Calendar[],
        Strategy: SimulationImpl
    ): Promise<BacktestBatchResult> {
        const mockBroker = new MockBrokerage();

        const start = parseISO(batch.startDate).getTime();
        const end = parseISO(batch.endDate).getTime();

        const watchlist: BacktestWatchlist = {};
        const positions: BacktestPositions = {};

        let maxLeverage = 0;

        let currentTime = Simulator.getPremarketTimeForDay(start, calendar);

        while (currentTime <= end) {
            for (const symbol of batch.symbols) {
                if (!this.strategies[symbol]) {
                    this.strategies[symbol] = new Strategy(symbol, mockBroker);
                }

                try {
                    await runStrategy(
                        symbol,
                        calendar,
                        this.strategies[symbol],
                        currentTime
                    );
                } catch (e) {
                    LOGGER.error(`uncaught error when running strategy`, e);
                }
            }

            // call hook for mock brokerage
            if (isMarketOpen(calendar, currentTime)) {
                await mockBroker.tick(currentTime + this.updateInterval);
            }

            if (
                isMarketOpen(calendar, currentTime) ||
                isPremarket(calendar, currentTime)
            ) {
                if (isPremarket(calendar, currentTime)) {
                }
                currentTime += this.updateInterval;
            } else if (isBeforeMarketOpening(calendar, currentTime)) {
                currentTime = Simulator.getPremarketTimeForDay(
                    currentTime,
                    calendar
                );
            } else if (isAfterMarketClose(calendar, currentTime)) {
                const date = format(currentTime, DATE_FORMAT);

                const todaysWatchlist = Object.keys(this.strategies).filter(
                    (symbol) => {
                        return this.strategies[symbol].isInPlay();
                    }
                );

                watchlist[date] = todaysWatchlist;
                positions[date] = JSON.parse(
                    JSON.stringify(mockBroker.closedPositions)
                );

                currentTime = startOfDay(
                    addBusinessDays(currentTime, 1)
                ).getTime();
                maxLeverage = mockBroker.maxLeverage;
                mockBroker.reset();
                this.strategies = {};
            } else {
                currentTime += addBusinessDays(currentTime, 1).getTime();
            }
        }

        return {
            startDate: format(start, DATE_FORMAT),
            endDate: format(end, DATE_FORMAT),
            watchlist,
            positions,
            maxLeverage,
        };
    }

    static getPremarketTimeForDay(epoch: number, calendar: Calendar[]): number {
        try {
            const openTime = Simulator._getMarketOpenTimeForDay(
                epoch,
                calendar,
                0
            );

            return openTime - 2 * FIFTEEN_MINUTES;
        } catch (e) {
            throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
        }
    }

    static getMarketOpenTimeForDay(
        epoch: number,
        calendar: Calendar[]
    ): number {
        try {
            return Simulator._getMarketOpenTimeForDay(epoch, calendar, 0);
        } catch (e) {
            throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
        }
    }

    private static _getMarketOpenTimeForDay(
        epoch: number,
        calendar: Calendar[],
        attempt: number
    ): number {
        const todaysDate = format(epoch, DATE_FORMAT);

        const calendarEntry = calendar.find((c) => c.date === todaysDate);

        if (!calendarEntry && attempt < 5) {
            return this._getMarketOpenTimeForDay(
                addBusinessDays(epoch, 1).getTime(),
                calendar,
                ++attempt
            );
        } else if (!calendarEntry) {
            throw new Error(`no_calendar_found`);
        }

        const dateString = todaysDate + `T${calendarEntry.open}:00.000`;

        const marketOpenToday = zonedTimeToUtc(dateString, MarketTimezone);

        return marketOpenToday.getTime();
    }

    static getBatches(
        startDateStr: string,
        endDateStr: string,
        symbols: string[],
        batchSize: number = 100
    ): BacktestBatch[] {
        const startDate = parseISO(startDateStr);
        const endDate = parseISO(endDateStr);

        const difference = differenceInDays(startDate, endDate);

        if (Math.abs(difference) <= 1 && symbols.length < batchSize) {
            return [
                {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    symbols,
                    batchId: 0,
                },
            ];
        }
        const batches = [];

        let batchStartDate = startDate;

        const durations = [];

        while (batchStartDate.getTime() < endDate.getTime()) {
            let batchedEndDate = addBusinessDays(batchStartDate, 1);

            if (batchedEndDate.getTime() > endDate.getTime()) {
                batchedEndDate = endDate;
            }
            durations.push({
                startDate: batchStartDate,
                endDate: batchedEndDate,
            });
            batchStartDate = batchedEndDate;
        }

        let j = 0;

        for (const duration of durations) {
            for (let i = 0; i < symbols.length; i += batchSize) {
                batches.push({
                    startDate: duration.startDate.toISOString(),
                    endDate: duration.endDate.toISOString(),
                    symbols: symbols.slice(i, i + batchSize),
                    batchId: j++,
                });
            }
        }

        return batches;
    }
}

export interface BacktestBatch {
    startDate: string;
    endDate: string;
    symbols: string[];
    batchId: number;
}

export interface BacktestWatchlist {
    [index: string]: string[];
}

export interface BacktestPositions {
    [index: string]: ClosedMockPosition[];
}

export interface BacktestBatchResult {
    watchlist: BacktestWatchlist;
    positions: BacktestPositions;
    startDate: string;
    endDate: string;
    maxLeverage: number;
}

export interface AggregatedBacktestBatchResult {
    watchlist: string[];
    positions: ClosedMockPosition[];
    startDate: string;
    endDate: string;
    maxLeverage: number;
}

export const runStrategy = async (
    symbol: string,
    calendar: Calendar[],
    sim: SimulationStrategy,
    epoch: number
) => {
    if (isPremarket(calendar, epoch)) {
        await sim.beforeMarketStarts(epoch);
    } else if (isMarketClosing(calendar, epoch)) {
        await sim.beforeMarketCloses(epoch);
    } else if (isMarketOpen(calendar, epoch)) {
        if (sim.hasEntryTimePassed(epoch)) {
            await sim.afterEntryTimePassed(epoch);
        } else {
            await sim.rebalance(calendar, epoch);
        }
    } else if (isAfterMarketClose(calendar, epoch)) {
        await sim.onMarketClose(epoch);
    }
};
