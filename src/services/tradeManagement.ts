import {
    TradeConfig,
    Bar,
    TradePlan,
    TradeType,
    PositionDirection,
    TradeDirection,
    TimeInForce,
    OrderStatus,
} from "../data/data.model";
import { alpaca } from "../resources/alpaca";
import { AlpacaOrder, AlpacaTradeConfig, Broker } from "@neeschit/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { isMarketClosing } from "../util/market";
import { insertOrder } from "../resources/order";
import { insertPlannedPosition, FilledPositionConfig, PositionConfig } from "../resources/position";
import { roundHalf } from "../util";
import { TrendType } from "../pattern/trend/trendIdentifier";
import { getDirectionalMovementIndex } from "../indicator/dmi";

export const isClosingOrder = (currentPosition: FilledPositionConfig, tradeConfig: TradeConfig) => {
    if (currentPosition.side === PositionDirection.long) {
        return tradeConfig.side === TradeDirection.sell;
    } else {
        return tradeConfig.side === TradeDirection.buy;
    }
};

export const processOrderFromStrategy = (
    order: TradeConfig,
    tradePlan?: TradePlan
): AlpacaTradeConfig => {
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
        extended_hours: false,
    };

    if (type === TradeType.limit || type === TradeType.stop_limit) {
        trade.limit_price = price;
    }

    if (type === TradeType.stop || type === TradeType.stop_limit) {
        trade.stop_price = stop;
    }

    if (tradePlan) {
        let riskUnits = Math.abs(tradePlan.plannedEntryPrice - tradePlan.plannedStopPrice);

        riskUnits = riskUnits > 0.4 ? roundHalf(riskUnits) : riskUnits;

        const profitPrice =
            tradePlan.side === PositionDirection.short
                ? tradePlan.plannedEntryPrice - riskUnits + 0.02
                : tradePlan.plannedEntryPrice + riskUnits - 0.02;

        trade.order_class = "bracket";
        trade.stop_loss = {
            stop_price: tradePlan.plannedStopPrice,
        };
        trade.take_profit = {
            limit_price: profitPrice,
        };
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
        plannedStopPrice: plannedStopPriceStr,
        plannedEntryPrice: plannedEntryPriceStr,
        side: positionSide,
        quantity,
        averageEntryPrice: averageEntryPriceStr,
        originalQuantity: originalQuantityStr,
    } = position;

    const averageEntryPrice = averageEntryPriceStr && Number(averageEntryPriceStr);
    const plannedStopPrice = plannedStopPriceStr && Number(plannedStopPriceStr);
    const plannedEntryPrice = plannedEntryPriceStr && Number(plannedEntryPriceStr);
    const originalQuantity = originalQuantityStr && Number(originalQuantityStr);

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
            t,
        };
    } else if (currentBar.c > plannedStopPrice && positionSide === PositionDirection.short) {
        return {
            symbol,
            price: 0,
            type: TradeType.market,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity,
            t,
        };
    }

    const exitPrice = currentBar.c;

    const pnl =
        positionSide === PositionDirection.long
            ? exitPrice - averageEntryPrice
            : averageEntryPrice - exitPrice;

    const currentProfitRatio = pnl / plannedRiskUnits;

    const positionPercentageLeft = quantity / originalQuantity;

    const plannedExitPrice =
        positionSide === PositionDirection.long
            ? roundHalf(plannedEntryPrice + plannedRiskUnits) - 0.01
            : roundHalf(plannedEntryPrice - plannedRiskUnits) + 0.01;

    if (currentProfitRatio >= partialProfitRatio * 0.7 && positionPercentageLeft > 0.2) {
        return {
            symbol,
            price: plannedExitPrice,
            type: TradeType.limit,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: Math.ceil(quantity * 0.8),
            t,
        };
    } else if (currentProfitRatio > partialProfitRatio * 1.5) {
        const partialRiskUnits = plannedRiskUnits * 2;
        const plannedExitPrice =
            positionSide === PositionDirection.long
                ? roundHalf(plannedEntryPrice + partialRiskUnits) - 0.05
                : roundHalf(plannedEntryPrice - partialRiskUnits) + 0.05;

        return {
            symbol,
            price: plannedExitPrice,
            type: TradeType.limit,
            side: closingOrderSide,
            tif: TimeInForce.gtc,
            quantity: quantity,
            t,
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
        t: Date.now(),
    };
};

export class TradeManagement {
    position?: PositionConfig;
    filledPosition?: FilledPositionConfig;

    constructor(
        public config: TradeConfig,
        public plan: TradePlan,
        private partialProfitRatio: number,
        private broker: Broker = alpaca
    ) {}

    async getPosition() {
        if (!this.position) {
            this.position = await insertPlannedPosition(this.plan);
        }

        return this.position;
    }

    async cancelPendingTrades() {
        const position = await this.getPosition();

        if (!position.pendingOrders || !position.pendingOrders.length) {
            return null;
        }

        for (const order of position.pendingOrders) {
            const alpacaOrder = await this.broker.getOrderByClientId(order.id.toString());

            await this.broker.cancelOrder(alpacaOrder.id);
        }
    }

    async executeAndRecord() {
        const order = await this.queueEntry();

        if (order && order.status !== OrderStatus.new) {
            LOGGER.error(`could not verify order for ${JSON.stringify(this.plan)}`);
        }

        return order;
    }

    async queueTrade(trade: TradeConfig) {
        const position = await this.getPosition();
        const order = processOrderFromStrategy(trade);
        const insertedOrder = await insertOrder(order, position);
        order.client_order_id = insertedOrder.id.toString();

        position.pendingOrders = position.pendingOrders || [];
        position.pendingOrders.push(insertedOrder);

        try {
            const placedOrder = await this.broker.createOrder(order);
            return placedOrder;
        } catch (e) {
            LOGGER.error(e);
        }

        return null;
    }

    async queueEntry() {
        const alpacaOrder = await this.queueTrade(this.config);

        return alpacaOrder;
    }

    async onTickUpdate(currentBar: Bar, openOrders: AlpacaOrder[]) {
        if (
            !this.filledPosition ||
            !this.filledPosition.quantity ||
            !this.filledPosition.averageEntryPrice
        ) {
            LOGGER.error("no position or order was never fulfilled");
            return null;
        }
        const plannedRiskUnits = Math.abs(this.plan.plannedEntryPrice - this.plan.plannedStopPrice);

        const exitPrice = currentBar.c;

        const pnl =
            this.filledPosition.side === PositionDirection.long
                ? exitPrice - this.filledPosition.averageEntryPrice
                : this.filledPosition.averageEntryPrice - exitPrice;

        const currentProfitRatio = pnl / plannedRiskUnits;

        try {
            const limitOrders = openOrders.filter((o) => o.type === TradeType.limit);

            if (currentProfitRatio < this.partialProfitRatio / 3) {
                await Promise.all(limitOrders.map((o) => this.broker.cancelOrder(o.id)));
            }
        } catch (e) {
            LOGGER.error(e);
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
            return null;
        } else {
            const isOrderDifferent =
                !openOrders.length ||
                (openOrders.length && openOrders.some((o) => o.type !== config.type));

            if (isOrderDifferent) {
                await Promise.all(openOrders.map((o) => this.broker.cancelOrder(o.id)));
                return this.queueTrade(config);
            }
        }

        return null;
    }

    async fetchCurrentPosition() {
        const alpacaPosition = await this.broker.getPosition(this.plan.symbol);

        const position = await this.getPosition();

        position.quantity = Number(alpacaPosition.qty);

        return position;
    }

    async recordTradeOnceFilled(order: AlpacaOrder): Promise<FilledPositionConfig> {
        const { symbol, status } = order;

        const position = await this.getPosition();

        this.filledPosition = Object.assign({}, position, {
            trades: [
                {
                    ...this.config,
                    quantity: order.filled_qty,
                    symbol,
                    averagePrice: order.filled_avg_price,
                    filledQuantity: order.filled_qty,
                    status,
                },
            ],
            averageEntryPrice: order.filled_avg_price,
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
            const position = await this.getPosition();
            order = await rebalancePosition(
                {
                    averageEntryPrice: Number(this.filledPosition.averageEntryPrice),
                    symbol: this.plan.symbol,
                    side: position.side,
                    ...this.plan,
                    quantity: this.filledPosition.quantity,
                    originalQuantity: this.plan.quantity,
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

    async detectTrendChange(recentBars: Bar[], alpacaOrder: AlpacaOrder) {
        const { pdmi, ndmi } = getDirectionalMovementIndex(recentBars);

        const trend = pdmi[pdmi.length - 1] > ndmi[ndmi.length - 1] ? TrendType.up : TrendType.down;

        const cancel =
            (trend === TrendType.up && alpacaOrder.side === TradeDirection.sell) ||
            (trend === TrendType.down && alpacaOrder.side === TradeDirection.buy);

        if (cancel) {
            await this.broker.cancelOrder(alpacaOrder.id);
        }

        return !cancel;
    }
}
