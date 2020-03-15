import { FilledPositionConfig, PositionDirection, TradeDirection } from "../data/data.model";
import { getMonth, isSameMonth, isAfter } from "date-fns";

export interface Performance {
    profit: number;
    longs: number;
    shorts: number;
    winners: number;
    total: number;
}

const getDatePositionEntered = (position: FilledPositionConfig) => {
    return new Date(position.trades[0].t);
};

export const getDetailedPerformanceReport = (positions: FilledPositionConfig[]) => {
    if (!positions || !positions.length) {
        throw new Error("Wrong number");
    }
    let currentMonth = getDatePositionEntered(positions[0]);
    const monthlyPerformances: Performance[] = [];

    const positionsAnalyzer = (
        position: FilledPositionConfig,
        performance: Performance,
        index: number
    ) => {
        const positionMonth = getDatePositionEntered(position);

        if (!isSameMonth(positionMonth, currentMonth) || index === positions.length - 1) {
            currentMonth = positionMonth;
            if (!monthlyPerformances.length) {
                monthlyPerformances.push(performance);
            } else {
                const perfSoFar = monthlyPerformances.reduce(
                    (agg, p) => {
                        if (!agg) {
                            return p;
                        } else {
                            agg.profit += p.profit;
                            agg.longs += p.longs;
                            agg.shorts += p.shorts;
                            agg.total += p.total;
                            agg.winners += p.winners;

                            return agg;
                        }
                    },
                    {
                        profit: 0,
                        longs: 0,
                        shorts: 0,
                        winners: 0,
                        total: 0
                    }
                );

                monthlyPerformances.push({
                    profit: performance.profit - perfSoFar.profit,
                    longs: performance.longs - perfSoFar.longs,
                    shorts: performance.shorts - perfSoFar.shorts,
                    total: performance.total - perfSoFar.total,
                    winners: performance.winners - perfSoFar.winners
                });
            }
        }
    };

    const sortedPositions = positions.sort((a, b) => {
        const d1 = getDatePositionEntered(a);
        const d2 = getDatePositionEntered(b);

        return isAfter(d1, d2) ? 1 : -1;
    });

    const simpleAnalysis = analyzeClosedPositions(sortedPositions, positionsAnalyzer);

    return {
        summary: simpleAnalysis,
        monthly: monthlyPerformances,
        sortedPositions
    };
};

export const analyzeClosedPositions = (
    positions: FilledPositionConfig[],
    onNextPositionCallback?: (
        position: FilledPositionConfig,
        performance: Performance,
        index: number
    ) => void
) => {
    const { profit, longs, shorts, winners, total } = positions.reduce(
        ({ profit, longs, shorts, winners }, position, index) => {
            if (position.side === PositionDirection.short) {
                shorts++;
            } else {
                longs++;
            }
            const pnl = position.trades.reduce((total, trade) => {
                if (trade.side === TradeDirection.buy) {
                    total -= trade.order.filledQuantity * trade.order.averagePrice;
                } else {
                    total += trade.order.filledQuantity * trade.order.averagePrice;
                }

                return total;
            }, 0);

            if (pnl > 0) {
                winners++;
            }

            profit += pnl;

            const perf: Performance = {
                profit,
                longs,
                shorts,
                winners,
                total: longs + shorts
            };

            if (onNextPositionCallback) {
                onNextPositionCallback(position, perf, index);
            }

            return perf;
        },
        {
            profit: 0,
            longs: 0,
            shorts: 0,
            winners: 0,
            total: 0
        }
    );

    return {
        profit,
        longs,
        shorts,
        winners,
        total
    };
};
