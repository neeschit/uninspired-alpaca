import { Bar, TradeConfig, FilledPositionConfig } from "../data/data.model";
import { TradeDirection, PositionDirection, OrderStatus, TradeType } from "../data/data.model";
import { formatInEasternTimeForDisplay } from "../util/date";
import { TimeInForce } from "@alpacahq/alpaca-trade-api";

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
                averagePrice: plannedEntryPrice + 0.01,
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
                averagePrice: plannedEntryPrice - 0.01,
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
            averagePrice: bar.c,
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
                averagePrice: bar.h + 0.01,
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
                averagePrice: bar.l - 0.01,
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

export const liquidatePosition = (position: FilledPositionConfig, bar: Bar): FilledPositionConfig => {
    const symbol = position.symbol;
    
    const order = {
        filledQuantity: position.quantity,
        symbol: symbol,
        averagePrice: bar.c,
        status: OrderStatus.filled
    };

    position.trades.push({
        /* order, */
        side: position.side === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy,
        quantity: position.quantity,
        type: TradeType.market,
        price: 0,
        tif: TimeInForce.day,
        symbol,
        t: Date.now(),
        filledQuantity: order.filledQuantity,
        status: order.status,
        averagePrice: order.averagePrice
    });

    position.quantity -= order.filledQuantity;

    return position;
}
