import { FilledPositionConfig, PositionDirection, TradeDirection } from "../data/data.model";

export interface Performance {
    profit: number;
}

export const analyzeClosedPositions = (positions: FilledPositionConfig[]) => {
    const { profit, longs, shorts, winners, total } = positions.reduce(
        ({ profit, longs, shorts, winners }, position) => {
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

            return {
                profit,
                longs,
                shorts,
                winners,
                total: longs + shorts
            };
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
