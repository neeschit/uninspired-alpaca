import { Calendar } from "@neeschit/alpaca-trade-api";
import {
    addBusinessDays,
    differenceInDays,
    endOfDay,
    format,
    parseISO,
    startOfDay,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { MarketTimezone } from "../core-utils/data/data.model";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { SimulationStrategy, TelemetryModel } from "./simulation.strategy";
import {
    DATE_FORMAT,
    FIFTEEN_MINUTES,
    isAfterMarketClose,
    isBeforeMarketOpening,
    isMarketClosing,
    isMarketOpen,
    isPremarket,
} from "./timing.util";
import { LOGGER } from "../core-utils/instrumentation/log";
import { ClosedMockPosition, MockBrokerage } from "./mockBrokerage";

export type SimulationImpl<T extends TelemetryModel> = new (
    ...args: any[]
) => SimulationStrategy<T>;

export function mergeResults<T extends TelemetryModel>(
    results: BacktestBatchResult<T>[],
    batchResult: BacktestBatchResult<T>
) {
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
}

export interface SimulationResult {
    totalPnl: number;
    maxLeverage: number;
    maxLeverageDate: string;
    maxDrawdown: number;
    maxDrawdownDate: string;
    results: AggregatedBacktestBatchResult[];
}

export class Simulator<T extends TelemetryModel> {
    private readonly updateInterval = 60000;

    private strategies: { [index: string]: SimulationStrategy<T> } = {};

    async run(
        batches: BacktestBatch[],
        strategy: SimulationImpl<T>,
        startDate: string,
        endDate: string
    ): Promise<SimulationResult> {
        const results: BacktestBatchResult<T>[] = [];

        const calendar = await getCalendar(
            addBusinessDays(parseISO(startDate), -5),
            parseISO(endDate)
        );

        for await (const batchResult of this.syncToAsyncIterable(
            batches,
            strategy,
            calendar
        )) {
            mergeResults(results, batchResult);
        }

        const filteredResults: AggregatedBacktestBatchResult[] = results
            .filter((r) => {
                return r.positions[r.startDate];
            })
            .map((r) => {
                const pnl = r.positions[r.startDate].reduce((totalPnl, p) => {
                    totalPnl += p.totalPnl;
                    return totalPnl;
                }, 0);
                return {
                    startDate: r.startDate,
                    endDate: r.endDate,
                    maxLeverage: r.maxLeverage,
                    positions: r.positions[r.startDate],
                    watchlist: r.watchlist[r.startDate],
                    pnl,
                };
            });

        const totalPnl = filteredResults.reduce((totalPnl, r) => {
            totalPnl += r.pnl;
            return totalPnl;
        }, 0);

        let maxDrawdownDate = "";
        let maxLeverageDate = "";

        const maxLeverage = filteredResults.reduce((leverage, result) => {
            maxLeverageDate =
                leverage < result.maxLeverage
                    ? result.startDate
                    : maxLeverageDate;
            leverage = Math.max(leverage, result.maxLeverage);
            return leverage;
        }, 0);

        const maxDrawdown = filteredResults.reduce((drawdown, result) => {
            maxDrawdownDate =
                result.pnl < drawdown ? result.startDate : maxDrawdownDate;
            drawdown = Math.min(drawdown, result.pnl);
            return drawdown;
        }, Number.MAX_SAFE_INTEGER);

        return {
            totalPnl,
            results: filteredResults,
            maxLeverage,
            maxDrawdown,
            maxDrawdownDate,
            maxLeverageDate,
        };
    }

    private async *syncToAsyncIterable(
        batches: BacktestBatch[],
        strategy: SimulationImpl<T>,
        calendar: Calendar[]
    ) {
        for (const batch of batches) {
            LOGGER.info(`running batch ${JSON.stringify(batch)}`);
            const result = await this.executeBatch(batch, calendar, strategy);
            yield result;
        }
    }

    private async executeBatch(
        batch: BacktestBatch,
        calendar: Calendar[],
        Strategy: SimulationImpl<T>
    ): Promise<BacktestBatchResult<T>> {
        const mockBroker = new MockBrokerage();
        this.strategies = {};

        const start = parseISO(batch.startDate).getTime();
        const end = endOfDay(parseISO(batch.endDate)).getTime();

        const watchlist: BacktestWatchlist = {};
        const positions: BacktestPositions<T> = {};

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
                await mockBroker.tick(currentTime);
            }

            if (
                isMarketOpen(calendar, currentTime) ||
                isPremarket(calendar, currentTime)
            ) {
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
                const rawPositions: ClosedMockPosition[] = JSON.parse(
                    JSON.stringify(mockBroker.closedPositions)
                );

                const loggedStatsPromises: Promise<{
                    [index: string]: T;
                }>[] = rawPositions.map(async (p) => {
                    return {
                        [p.symbol]: await this.strategies[
                            p.symbol
                        ].logTelemetryForProfitHacking(
                            p,
                            calendar,
                            currentTime
                        ),
                    };
                });

                const results: { [index: string]: T }[] = await Promise.all(
                    loggedStatsPromises
                );

                positions[date] = rawPositions.map((p) => {
                    const loggedStats = results.find((r) => r[p.symbol]);

                    if (!loggedStats) {
                        throw new Error();
                    }

                    return {
                        ...p,
                        loggedStats: loggedStats[p.symbol],
                    };
                });

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
            const openTime = Simulator._getMarketTimeForDay(
                epoch,
                calendar,
                0,
                false,
                true
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
            return Simulator._getMarketTimeForDay(
                epoch,
                calendar,
                0,
                false,
                true
            );
        } catch (e) {
            throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
        }
    }

    static getMarketCloseTimeForDay(
        epoch: number,
        calendar: Calendar[]
    ): number {
        try {
            return Simulator._getMarketTimeForDay(
                epoch,
                calendar,
                0,
                false,
                false
            );
        } catch (e) {
            throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
        }
    }

    static getMarketOpenTimeForYday(
        epoch: number,
        calendar: Calendar[]
    ): number {
        try {
            return Simulator._getMarketTimeForDay(
                addBusinessDays(epoch, -1).getTime(),
                calendar,
                0,
                true,
                true
            );
        } catch (e) {
            throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
        }
    }

    private static _getMarketTimeForDay(
        epoch: number,
        calendar: Calendar[],
        attempt: number,
        goBackwards: boolean,
        isOpen: boolean
    ): number {
        const todaysDate = format(epoch, DATE_FORMAT);

        const calendarEntry = calendar.find((c) => c.date === todaysDate);

        if (!calendarEntry && attempt < 5) {
            return this._getMarketTimeForDay(
                addBusinessDays(epoch, goBackwards ? -1 : 1).getTime(),
                calendar,
                ++attempt,
                goBackwards,
                isOpen
            );
        } else if (!calendarEntry) {
            throw new Error(`no_calendar_found`);
        }

        const dateString =
            todaysDate +
            `T${isOpen ? calendarEntry.open : calendarEntry.close}:00.000`;

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

export interface InflatedBacktestPosition<T extends TelemetryModel>
    extends ClosedMockPosition {
    loggedStats: T;
}

export interface BacktestPositions<T extends TelemetryModel> {
    [index: string]: InflatedBacktestPosition<T>[];
}

export interface BacktestBatchResult<T extends TelemetryModel> {
    watchlist: BacktestWatchlist;
    positions: BacktestPositions<T>;
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
    pnl: number;
}

export async function runStrategy<T extends TelemetryModel>(
    symbol: string,
    calendar: Calendar[],
    sim: SimulationStrategy<T>,
    epoch: number
) {
    try {
        if (isPremarket(calendar, epoch)) {
            await sim.beforeMarketStarts(calendar, epoch);
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
    } catch (e) {
        LOGGER.error(`uncaught exception for ${symbol} at ${epoch}`, e);
    }
}

export const getBatchesForRetry = (
    result: SimulationResult
): {
    batches: BacktestBatch[];
    startDate: string;
    endDate: string;
} => {
    const days = result.results;

    const daysWithWatchlistItems = days.filter((d) => d.watchlist.length > 0);

    const batches = daysWithWatchlistItems.map<BacktestBatch>((d, index) => {
        const symbols = d.watchlist;
        return {
            symbols,
            startDate: d.startDate,
            endDate: d.startDate,
            batchId: index,
        };
    });

    return {
        batches,
        startDate: daysWithWatchlistItems[0].startDate,
        endDate:
            daysWithWatchlistItems[daysWithWatchlistItems.length - 1].endDate,
    };
};
