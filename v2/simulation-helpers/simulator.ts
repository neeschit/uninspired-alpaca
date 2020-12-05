import { addMonths, differenceInMonths, parseISO } from "date-fns";

export class Simulator {
    private updateInterval = 60000;
    private startDate: number;
    private endDate: number;
    private profitRatio = 2;

    constructor({
        startDate,
        endDate,
        profitRatio,
    }: {
        startDate: string;
        endDate: string;
        profitRatio?: number;
    }) {
        this.endDate = parseISO(endDate).getTime();
        this.startDate = parseISO(startDate).getTime();
        this.profitRatio = profitRatio || this.profitRatio;

        jest.setSystemTime(this.startDate);
    }

    async run(batches: BacktestBatch[]) {
        const results: BacktestBatchResult[] = [];
        for await(const batchResult of this.syncToAsyncIterable(batches) {
            
        }
    }

    async *syncToAsyncIterable(batches: BacktestBatch[]) {
        for (const batch of batches) {
            yield batch;
        }
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

        let j = 0;

        for (const duration of durations) {
            for (let i = 0; i < symbols.length; i += batchSize) {
                batches.push({
                    startDate: duration.startDate,
                    endDate: duration.endDate,
                    symbols: symbols.slice(i, i + batchSize),
                    batchId: j++,
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

export interface BacktestBatchResult {
    watchlists: {[index: string]: string[]};
    trades: {[index: string]: string[]};
}
