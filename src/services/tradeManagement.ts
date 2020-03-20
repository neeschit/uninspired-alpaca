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
import Alpaca, { AlpacaOrder, AlpacaTradeConfig } from "@alpacahq/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";

export const processOrderFromStrategy = (order: TradeConfig): AlpacaTradeConfig => {
    const { quantity, tif, price, type, side, symbol, stopPrice = price } = order;

    if (type === TradeType.stop_limit && stopPrice === price) {
        throw new Error("need a separate stop price for stop limit orders");
    }

    const stop = type === TradeType.stop_limit ? stopPrice : type === TradeType.stop ? price : 0;

    const trade: AlpacaTradeConfig = {
        qty: quantity,
        symbol,
        time_in_force: tif,
        order_class: "simple",
        type,
        side,
        extended_hours: false
    };

    if (type === TradeType.limit || type === TradeType.stop_limit) {
        trade.limit_price = price;
    }

    if (type === TradeType.stop || type === TradeType.stop_limit) {
        trade.stop_price = stop;
    }

    return trade;
};

export const rebalancePosition = async (
    position: FilledPositionConfig,
    currentBar: Bar
): Promise<TradeConfig | null> => {
    const {
        symbol,
        plannedStopPrice,
        plannedEntryPrice,
        side: positionSide,
        quantity,
        originalQuantity
    } = position;

    let {
        averageEntryPrice,
    } = position;

    if (!quantity || quantity < 0) {
        return null;
    }

    if (!averageEntryPrice) {
        averageEntryPrice = position.order && position.order.averagePrice;
    }
    
    if (!averageEntryPrice) {
        LOGGER.warn(`Need an entry price for ${symbol}`);
        return null;
    }

    const plannedRiskUnits = Math.abs(plannedEntryPrice - plannedStopPrice);

    const closingOrderSide =
        positionSide === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy;

    if (currentBar.c < plannedStopPrice && positionSide === PositionDirection.long) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity,
            t: Date.now()
        };
    } else if (currentBar.c > plannedStopPrice && positionSide === PositionDirection.short) {
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

    LOGGER.trace(pnl);
    LOGGER.trace(currentBar);
    LOGGER.trace(position);
    LOGGER.trace(currentProfitRatio);
    LOGGER.trace(symbol);

    LOGGER.trace(originalQuantity);
    LOGGER.trace(quantity);

    if (currentProfitRatio > 0.9 && quantity === originalQuantity) {
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

    LOGGER.debug(currentProfitRatio);

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
    position: PositionConfig;
    order?: Order;
    trades: FilledTradeConfig[] = [];

    constructor(
        public config: TradeConfig,
        public plan: TradePlan,
        private broker: Alpaca = alpaca
    ) {
        this.position = {
            plannedEntryPrice: plan.plannedEntryPrice,
            plannedStopPrice: plan.plannedStopPrice,
            symbol: config.symbol
        } as PositionConfig;
    }

    async executeAndRecord() {
        const order = await this.queueTrade();
        const position = this.recordTradeOnceFilled(order);

        return position;
    }

    async queueTrade() {
        return this.broker.createOrder(processOrderFromStrategy(this.config));
    }

    async onTradeUpdate(currentBar: Bar) {
        if (!this.position || !this.order) {
            LOGGER.error("no position or order was never fulfilled");
            return;
        }
        const config: TradeConfig | null = await rebalancePosition(
            Object.assign(this.position, {
                order: this.order,
                trades: this.trades
            }),
            currentBar
        );

        if (!config) {
            LOGGER.info(
                `nothing to do for ${JSON.stringify(
                    this.plan
                )} with current bar ${JSON.stringify(currentBar)}`
            );
            return;
        }

        return this.broker.createOrder(processOrderFromStrategy(config));
    }

    async fetchCurrentPosition() {
        const position = await alpaca.getPosition(this.plan.symbol);

        this.position = {
            ...this.plan,
            plannedRiskUnits: Math.abs(this.plan.plannedEntryPrice - this.plan.plannedStopPrice),
            hasHardStop: false,
            originalQuantity: this.plan.quantity,
            quantity: Number(position.qty)
        }

        return this.position;
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
            trades: [
                {
                    ...this.config,
                    order: this.order,
                    quantity: order.filled_qty
                }
            ]
        });
    }
}
