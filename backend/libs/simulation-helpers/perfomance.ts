import { BacktestBatchResult } from "./simulator";

export const getPerformance = (results: BacktestBatchResult[]): number => {
    let total = 0;

    for (const r of results) {
        const positions = r.positions[r.startDate];
        const batchPnl = positions.reduce((total, position) => {
            total += position.totalPnl;

            return total;
        }, 0);

        total += batchPnl;
    }

    return total;
};
