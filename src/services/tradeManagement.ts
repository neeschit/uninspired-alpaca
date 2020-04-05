import {
    TradeConfig,
    PositionConfig,
    Bar,
    TradePlan,
    FilledPositionConfig,
    TradeType,
    PositionDirection,
    TradeDirection,
    TimeInForce,
    OrderStatus
} from "../data/data.model";
import { alpaca } from "../resources/alpaca";
import { AlpacaOrder, AlpacaTradeConfig, Broker } from "@alpacahq/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { isMarketClosing } from "../util/market";

export const isClosingOrder = (currentPosition: FilledPositionConfig, tradeConfig: TradeConfig) => {
    if (currentPosition.side === PositionDirection.long) {
        return tradeConfig.side === TradeDirection.sell;
    } else {
        return tradeConfig.side === TradeDirection.buy;
    }
};

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
    position: Pick<
        FilledPositionConfig,
        | "symbol"
        | "plannedStopPrice"
        | "plannedEntryPrice"
        | "side"
        | "quantity"
        | "originalQuantity"
        | "averageEntryPrice"
    >,
    currentBar: Bar,
    partialProfitRatio: number,
    t = Date.now()
): Promise<TradeConfig | null> => {
    const {
        symbol,
        plannedStopPrice,
        plannedEntryPrice,
        side: positionSide,
        quantity,
        averageEntryPrice
    } = position;

    if (!quantity || quantity < 0) {
        return null;
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
            t
        };
    } else if (currentBar.c > plannedStopPrice && positionSide === PositionDirection.short) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity,
            t
        };
    }

    const pnl =
        positionSide === PositionDirection.long
            ? currentBar.c - averageEntryPrice
            : averageEntryPrice - currentBar.c;

    const currentProfitRatio = pnl / plannedRiskUnits;

    if (currentProfitRatio >= partialProfitRatio) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity,
            t
        };
    }

    return null;
};

export const orderToLiquidatePosition = (position: FilledPositionConfig): TradeConfig => {
    const symbol = position.symbol;

    return {
        side: position.side === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy,
        quantity: position.quantity,
        type: TradeType.market,
        price: 0,
        tif: TimeInForce.day,
        symbol,
        t: Date.now()
    };
};

export class TradeManagement {
    position: PositionConfig;
    filledPosition?: FilledPositionConfig;

    constructor(
        public config: TradeConfig,
        public plan: TradePlan,
        private partialProfitRatio: number,
        private broker: Broker = alpaca
    ) {
        this.position = {
            plannedEntryPrice: plan.plannedEntryPrice,
            plannedStopPrice: plan.plannedStopPrice,
            symbol: config.symbol
        } as PositionConfig;
    }

    async executeAndRecord() {
        const order = await this.queueTrade();

        if (order.status !== OrderStatus.new) {
            LOGGER.error(`could not verify order for ${JSON.stringify(this.plan)}`);
        }

        return order;
    }

    async queueTrade() {
        return this.broker.createOrder(processOrderFromStrategy(this.config));
    }

    async onTickUpdate(currentBar: Bar) {
        if (!this.filledPosition) {
            LOGGER.error("no position or order was never fulfilled");
            return;
        }
        const config: TradeConfig | null = await rebalancePosition(
            this.filledPosition,
            currentBar,
            this.partialProfitRatio
        );

        if (!config) {
            LOGGER.info(
                `nothing to do for ${JSON.stringify(this.plan)} with current bar ${JSON.stringify(
                    currentBar
                )}`
            );
            return;
        }

        return this.broker.createOrder(processOrderFromStrategy(config));
    }

    async fetchCurrentPosition() {
        const position = await this.broker.getPosition(this.plan.symbol);

        this.position = {
            ...this.plan,
            plannedRiskUnits: Math.abs(this.plan.plannedEntryPrice - this.plan.plannedStopPrice),
            hasHardStop: false,
            originalQuantity: this.plan.quantity,
            quantity: Number(position.qty)
        };

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
            originalQuantity: order.filled_qty
        };

        this.filledPosition = Object.assign(this.position, {
            trades: [
                {
                    ...this.config,
                    quantity: order.filled_qty,
                    symbol,
                    averagePrice: order.filled_avg_price,
                    filledQuantity: order.filled_qty,
                    status
                }
            ],
            averageEntryPrice: order.filled_avg_price
        });

        return this.filledPosition;
    }

    async rebalancePosition(bar: Bar, now = Date.now()): Promise<TradeConfig | null> {
        if (!this.filledPosition) {
            return null;
        }

        const liquidate = isMarketClosing(bar.t);

        let order: TradeConfig | null;

        if (liquidate) {
            order = orderToLiquidatePosition(this.filledPosition);
        } else {
            order = await rebalancePosition(
                {
                    averageEntryPrice: Number(this.filledPosition.averageEntryPrice),
                    symbol: this.plan.symbol,
                    side: this.position.side,
                    quantity: Number(this.filledPosition.trades[0].filledQuantity),
                    ...this.plan,
                    originalQuantity: this.plan.quantity
                },
                bar,
                this.partialProfitRatio,
                now
            );
        }

        return order;
    }

    async validateTrade(tradeConfig: TradeConfig) {
        if (!this.filledPosition) {
            return true;
        }

        return isClosingOrder(this.filledPosition, tradeConfig);
    }
}
