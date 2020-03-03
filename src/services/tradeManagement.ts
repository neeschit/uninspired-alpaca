import {
    TradeConfig,
    PositionConfig,
    Bar,
    TradePlan,
    FilledPositionConfig,
    Order,
    TradeType,
    PositionDirection,
    TradeDirection,
    TimeInForce,
    FilledTradeConfig
} from "../data/data.model";
import { alpaca } from "../connection/alpaca";
import { AlpacaOrder, AlpacaTradeConfig, Broker } from "@alpacahq/alpaca-trade-api";

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
    order: FilledPositionConfig,
    currentBar: Bar
): Promise<TradeConfig | null> => {
    const { symbol, plannedRiskUnits, plannedStopPrice, side: positionSide, quantity } = order;

    const { averagePrice: averageEntryPrice } = order.order;

    const closingOrderSide =
        positionSide === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy;

    if (currentBar.c < plannedStopPrice) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity,
            t: Date.now()
        };
    }

    const pnl =
        positionSide === PositionDirection.long
            ? currentBar.c - averageEntryPrice
            : averageEntryPrice - currentBar.c;

    const currentProfitRatio = pnl / plannedRiskUnits;

    if (currentProfitRatio > 0.9 && quantity === order.originalQuantity) {
        console.log(symbol);
        return {
            symbol,
            price: currentBar.c,
            type: TradeType.limit,
            side: closingOrderSide,
            tif: TimeInForce.day,
            quantity: Math.ceil(quantity * 0.75),
            t: Date.now()
        };
    }

    if (currentProfitRatio > 2) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity,
            t: Date.now()
        };
    }

    return null;
};

export class TradeManagement {
    position?: PositionConfig;
    order?: Order;
    trades: FilledTradeConfig[] = [];

    constructor(
        private config: TradeConfig,
        private plan: TradePlan,
        private broker: Broker = alpaca
    ) {
        this.position = {
            plannedEntryPrice: plan.plannedEntryPrice,
            plannedStopPrice: plan.plannedStopPrice,
            symbol: config.symbol
        } as PositionConfig;
    }

    async queueTrade() {
        return this.broker.createOrder(processOrderFromStrategy(this.config));
    }

    onTradeUpdate(currentBar: Bar) {
        if (!this.position || !this.order || !this.order.filledQuantity) {
            console.error("no position or order was never fulfilled");
            return;
        }
        return rebalancePosition(
            Object.assign(this.position, {
                order: this.order,
                trades: this.trades
            }),
            currentBar
        );
    }

    recordTradeOnceFilled(order: AlpacaOrder): FilledPositionConfig {
        const { symbol, status } = order;
        this.position = {
            ...this.plan,
            symbol: order.symbol,
            quantity: order.filled_qty,
            plannedRiskUnits: Math.abs(this.plan.plannedEntryPrice - this.plan.plannedStopPrice),
            hasHardStop: false,
            originalQuantity: order.filled_qty,
            plannedQuantity: this.config.quantity
        };

        this.order = {
            symbol,
            averagePrice: order.filled_avg_price,
            filledQuantity: order.filled_qty,
            status
        };

        return Object.assign(this.position, {
            order: this.order,
            trades: [{
                ...this.config,
                order: this.order,
                quantity: order.filled_qty,
            }]
        });
    }
}
