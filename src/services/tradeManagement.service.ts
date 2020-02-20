import { TradeConfig, PositionConfig, Bar } from "../data/data.model";
import { AlpacaTradeConfig } from "../connection/alpaca";

export const processOrderFromStrategy = (order: TradeConfig): AlpacaTradeConfig => {
    const { quantity, tif, price, type, side, symbol } = order;

    return {
        qty: quantity,
        symbol,
        time_in_force: tif,
        stop_price: price,
        limit_price: price,
        order_class: "simple",
        type,
        side,
        extended_hours: false
    };
};

export const rebalancePosition = (order: PositionConfig, currentBar: Bar) => {
    const { symbol, plannedRiskUnits } = order;
};
