import { Bar, TradeConfig, FilledPositionConfig } from "../data/data.model";
import { TradeDirection, PositionDirection, OrderStatus, TradeType } from "../data/data.model";
import { formatInEasternTimeForDisplay } from "../util/date";

export const executeSingleTrade = (
    exit: number,
    bar: Bar,
    tradePlan: TradeConfig,
    plannedEntryPrice: number,
    currentPositionConfigs: FilledPositionConfig[]
): FilledPositionConfig | null => {
    const symbol = tradePlan.symbol;
    const side =
        tradePlan.side === TradeDirection.buy ? PositionDirection.long : PositionDirection.short;

    // simulate tradePlan.price
    const position: FilledPositionConfig | undefined = currentPositionConfigs.find(
        p => p.symbol === tradePlan.symbol
    );

    if (!bar) {
        return null;
    }

    tradePlan.estString = formatInEasternTimeForDisplay(tradePlan.t);

    if (!position) {
        let unfilledPosition = {
            symbol: symbol,
            originalQuantity: tradePlan.quantity,
            hasHardStop: false,
            plannedEntryPrice,
            plannedStopPrice: exit,
            plannedQuantity: tradePlan.quantity,
            plannedRiskUnits: Math.abs(tradePlan.price - exit),
            side: side,
            quantity: tradePlan.quantity
        };

        if (bar.h > tradePlan.price && tradePlan.side === TradeDirection.buy) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: bar.c + Math.random() / 10,
                status: OrderStatus.filled
            };

            return {
                ...unfilledPosition,
                trades: [
                    {
                        ...tradePlan,
                        ...order
                    }
                ]
            };
        } else if (bar.l < tradePlan.price && tradePlan.side === TradeDirection.sell) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: bar.c - Math.random() / 10,
                status: OrderStatus.filled
            };

            return {
                ...unfilledPosition,
                trades: [
                    {
                        ...tradePlan,
                        ...order
                    }
                ]
            };
        }

        return null;
    }

    if (tradePlan.type === TradeType.market) {
        const order = {
            filledQuantity: tradePlan.quantity,
            symbol: symbol,
            averagePrice: bar.c + Math.random() / 10,
            status: OrderStatus.filled
        };

        position.trades.push({
            /* order, */
            ...tradePlan,
            filledQuantity: order.filledQuantity,
            status: order.status,
            averagePrice: order.averagePrice
        });

        position.quantity -= order.filledQuantity;

        return position;
    } else {
        if (bar.h > tradePlan.price && tradePlan.side === TradeDirection.buy) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: bar.c + Math.random() / 10,
                status: OrderStatus.filled
            };

            position.trades.push({
                /* order, */
                ...tradePlan,
                filledQuantity: order.filledQuantity,
                status: order.status,
                averagePrice: order.averagePrice
            });
            position.quantity -= order.filledQuantity;

            return position;
        } else if (bar.l < tradePlan.price && tradePlan.side === TradeDirection.sell) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: bar.c - Math.random() / 10,
                status: OrderStatus.filled
            };

            position.trades.push({
                /* order, */
                ...tradePlan,
                filledQuantity: order.filledQuantity,
                status: order.status,
                averagePrice: order.averagePrice
            });
            position.quantity -= order.filledQuantity;

            return position;
        }
    }
    return null;
};
