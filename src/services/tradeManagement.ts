import {
    TradeConfig,
    PositionConfig,
    Bar,
    TradeDirection,
    TradeType,
    TimeInForce,
    PositionDirection
} from "../data/data.model";
import { AlpacaTradeConfig } from "../connection/alpaca";

export const processOrderFromStrategy = (order: TradeConfig): AlpacaTradeConfig => {
    const { quantity, tif, price, type, side, symbol, stopPrice = price } = order;

    if (type === TradeType.stop_limit && stopPrice === price) {
        throw new Error("need a separate stop price for stop limit orders");
    }

    const stop = type === TradeType.stop_limit ? stopPrice : type === TradeType.stop ? price : 0;

    return {
        qty: quantity,
        symbol,
        time_in_force: tif,
        stop_price: stop,
        limit_price: type === TradeType.limit || type === TradeType.stop_limit ? price : 0,
        order_class: "simple",
        type,
        side,
        extended_hours: false
    };
};

export const rebalancePosition = async (
    order: PositionConfig,
    currentBar: Bar
): Promise<TradeConfig | null> => {
    const {
        symbol,
        plannedRiskUnits,
        plannedStopPrice,
        side: positionSide,
        averageEntryPrice,
        quantity
    } = order;

    const closingOrderSide =
        positionSide === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy;

    if (currentBar.c < plannedStopPrice) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity
        };
    }

    const pnl =
        positionSide === PositionDirection.long
            ? currentBar.c - averageEntryPrice
            : averageEntryPrice - currentBar.c;

    const currentProfitRatio = pnl / plannedRiskUnits;

    if (currentProfitRatio > 0.9 && quantity === order.originalQuantity) {
        return {
            symbol,
            price: currentBar.c,
            type: TradeType.limit,
            side: closingOrderSide,
            tif: TimeInForce.day,
            quantity: Math.ceil(quantity * 0.75)
        };
    }

    if (currentProfitRatio > 3) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity
        };
    }

    return null;
};
