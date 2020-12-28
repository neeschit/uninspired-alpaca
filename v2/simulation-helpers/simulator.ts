import { Calendar } from "@neeschit/alpaca-trade-api";
import {
    addBusinessDays,
    addMonths,
    differenceInMonths,
    format,
    parseISO,
    startOfDay,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { MarketTimezone } from "../../src/data/data.model";
import { getCalendar } from "../brokerage-helpers";
import { SimulationStrategy } from "./simulation.strategy";
import {
    isAfterMarketClose,
    isBeforeMarketOpening,
    isMarketClosing,
    isMarketOpen,
    isMarketOpening,
} from "./timing.util";
import { LOGGER } from "../../src/instrumentation/log";
import { MockBrokerage } from "./mockBrokerage";

export type SimulationImpl = new (...args: any[]) => SimulationStrategy;

export class Simulator {
    private readonly updateInterval = 60000;

    private strategies: { [index: string]: SimulationStrategy } = {};

    async run(batches: BacktestBatch[], strategy: SimulationImpl) {
        const results: BacktestBatchResult[] = [];
        for await (const batchResult of this.syncToAsyncIterable(
            batches,
            strategy
        )) {
            results.push(batchResult);
        }
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
        const mockBroker = MockBrokerage.getInstance();

        const start = parseISO(batch.startDate).getTime();
        const end = parseISO(batch.endDate).getTime();

        let currentTime =
            Simulator.getMarketOpenTimeForDay(start, calendar) -
            15 * this.updateInterval;

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
            await mockBroker.tick(currentTime + this.updateInterval);

            if (isMarketOpen(calendar, currentTime)) {
                currentTime += this.updateInterval;
            } else if (isBeforeMarketOpening(calendar, currentTime)) {
                currentTime = Simulator.getMarketOpenTimeForDay(
                    currentTime,
                    calendar
                );
            } else if (isAfterMarketClose(calendar, currentTime)) {
                currentTime = startOfDay(
                    addBusinessDays(currentTime, 1)
                ).getTime();
            }
        }

        return {};
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
        const dateFormat = "yyyy-MM-dd";
        const todaysDate = format(epoch, dateFormat);

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

        const months = differenceInMonths(startDate, endDate);

        if (Math.abs(months) <= 1 && symbols.length < batchSize) {
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

export interface BacktestBatchResult {
    [index: string]: {
        trades: string[];
    };
}

export const runStrategy = async (
    symbol: string,
    calendar: Calendar[],
    sim: SimulationStrategy,
    epoch: number
) => {
    if (
        isMarketOpening(calendar, epoch) ||
        isBeforeMarketOpening(calendar, epoch)
    ) {
        await sim.beforeMarketStarts(epoch);
    } else if (isMarketClosing(calendar, epoch)) {
        await sim.beforeMarketCloses(epoch);
    } else if (isMarketOpen(calendar, epoch)) {
        if (sim.hasEntryTimePassed(epoch)) {
            await sim.afterEntryTimePassed(epoch);
        } else {
            await sim.rebalance(epoch);
        }
    } else {
        await sim.onMarketClose(epoch);
    }
};
