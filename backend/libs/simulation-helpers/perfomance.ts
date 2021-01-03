import {
    AggregatedBacktestBatchResult,
    BacktestBatchResult,
} from "./simulator";

export const getPerformance = (
    results: AggregatedBacktestBatchResult[]
): number => {
    let total = 0;

    for (const r of results) {
        const positions = r.positions;
        const batchPnl = positions.reduce((total, position) => {
            total += position.totalPnl;

            return total;
        }, 0);

        total += batchPnl;
    }

    return total;
};
