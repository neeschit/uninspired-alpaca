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
import { DailyWatchlist } from "../screener-api";
import { isAfterMarketClose, isBeforeMarketOpening, isMarketOpen } from "./timing.util";

export class Simulator {
    private readonly updateInterval = 60000;

    constructor() {
        jest.useFakeTimers("modern");
    }

    async run(batches: BacktestBatch[]) {
        const results: BacktestBatchResult[] = [];
        for await (const batchResult of this.syncToAsyncIterable(batches)) {
            results.push(batchResult);
        }
    }

    async *syncToAsyncIterable(batches: BacktestBatch[]) {
        for (const batch of batches) {
            const start = parseISO(batch.startDate);
            const end = parseISO(batch.endDate);
            const calendar = await getCalendar(start, end);
            const result = await this.executeBatch(batch, calendar);
            yield result;
        }
    }

    async executeBatch(batch: BacktestBatch, calendar: Calendar[]): Promise<BacktestBatchResult> {
        const start = parseISO(batch.startDate).getTime();
        const end = parseISO(batch.endDate).getTime();

        let currentTime = Simulator.getMarketOpenTimeForDay(start, calendar);

        while (currentTime <= end) {
            jest.setSystemTime(currentTime);

            if (isMarketOpen(calendar, currentTime)) {
                // call rebalance
                currentTime += this.updateInterval;
            } else if (isBeforeMarketOpening(calendar, currentTime)) {
                //call hook
                currentTime = Simulator.getMarketOpenTimeForDay(currentTime, calendar);
            } else if (isAfterMarketClose(calendar, currentTime)) {
                //call hook
                currentTime = startOfDay(addBusinessDays(currentTime, 1)).getTime();
            } else {
                currentTime += this.updateInterval;
            }
        }

        return {};
    }

    static getMarketOpenTimeForDay(epoch: number, calendar: Calendar[]): number {
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
        watchlist: DailyWatchlist[];
        trades: string[];
    };
}
