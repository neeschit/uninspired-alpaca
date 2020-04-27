import { PositionDirection, TradeDirection } from "../data/data.model";
import { isSameMonth, isAfter, isSameDay } from "date-fns";
import { FilledPositionConfig, ClosedPositionConfig } from "../resources/position";

export interface Performance {
    profit: number;
    longs: number;
    shorts: number;
    winners: number;
    total: number;
}

export interface MonthlyPerformance {
    dailyPerformances: Performance[];
    summary: Performance;
}

const getDatePositionEntered = (position: FilledPositionConfig) => {
    return new Date(position.trades[0].t);
};

export const getDetailedPerformanceReport = (positions: FilledPositionConfig[]) => {
    if (!positions || !positions.length) {
        throw new Error("Wrong number");
    }
    let currentMonth = getDatePositionEntered(positions[0]);
    let currentDate = currentMonth;
    const monthlyPerformances: MonthlyPerformance[] = [];
    const dailyPerformances: Performance[] = [];

    const positionsAnalyzer = (
        position: FilledPositionConfig,
        performance: Performance,
        index: number
    ) => {
        const positionDate = getDatePositionEntered(position);

        if (!isSameDay(currentDate, positionDate)) {
            currentDate = positionDate;
        }

        if (!isSameMonth(positionDate, currentMonth) || index === positions.length - 1) {
            currentMonth = positionDate;
            if (!monthlyPerformances.length) {
                monthlyPerformances.push({
                    summary: performance,
                    dailyPerformances: [performance],
                });
            } else {
                const perfSoFar = monthlyPerformances.reduce(
                    (agg, p) => {
                        if (!agg) {
                            return p.summary;
                        } else {
                            agg.profit += p.summary.profit;
                            agg.longs += p.summary.longs;
                            agg.shorts += p.summary.shorts;
                            agg.total += p.summary.total;
                            agg.winners += p.summary.winners;

                            return agg;
                        }
                    },
                    {
                        profit: 0,
                        longs: 0,
                        shorts: 0,
                        winners: 0,
                        total: 0,
                    }
                );

                monthlyPerformances.push({
                    summary: {
                        profit: performance.profit - perfSoFar.profit,
                        longs: performance.longs - perfSoFar.longs,
                        shorts: performance.shorts - perfSoFar.shorts,
                        total: performance.total - perfSoFar.total,
                        winners: performance.winners - perfSoFar.winners,
                    },
                    dailyPerformances: [],
                });
            }
        }
    };

    const sortedPositions = positions
        .sort((a, b) => {
            const d1 = getDatePositionEntered(a);
            const d2 = getDatePositionEntered(b);

            return isAfter(d1, d2) ? 1 : -1;
        })
        .map<ClosedPositionConfig>((p) => {
            return {
                ...p,
                pnl: getPnL(p),
            };
        });

    const simpleAnalysis = analyzeClosedPositions(sortedPositions, positionsAnalyzer);

    return {
        summary: simpleAnalysis,
        monthly: monthlyPerformances,
        sortedPositions,
    };
};

export const analyzeClosedPositions = (
    positions: FilledPositionConfig[],
    onNextPositionCallback?: (
        position: FilledPositionConfig,
        performance: Performance,
        index: number,
        pnl: number
    ) => void
) => {
    const { profit, longs, shorts, winners, total } = positions.reduce(
        ({ profit, longs, shorts, winners }, position, index) => {
            if (position.side === PositionDirection.short) {
                shorts++;
            } else {
                longs++;
            }
            const pnl = getPnL(position);

            if (pnl > 0) {
                winners++;
            }

            profit += pnl;

            const perf: Performance = {
                profit,
                longs,
                shorts,
                winners,
                total: longs + shorts,
            };

            if (onNextPositionCallback) {
                onNextPositionCallback(position, perf, index, pnl);
            }

            return perf;
        },
        {
            profit: 0,
            longs: 0,
            shorts: 0,
            winners: 0,
            total: 0,
        }
    );

    return {
        profit,
        longs,
        shorts,
        winners,
        total,
    };
};
function getPnL(position: FilledPositionConfig) {
    return position.trades.reduce((total, trade) => {
        if (trade.side === TradeDirection.buy) {
            total -= trade.filledQuantity * trade.averagePrice;
        } else {
            total += trade.filledQuantity * trade.averagePrice;
        }
        return total;
    }, 0);
}
