import {
    AlpacaOrder,
    AlpacaTradeConfig,
    OrderStatus,
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { alpaca, getOpenOrders } from "../src/resources/alpaca";
import { insertOrder, Order } from "../src/resources/order";
import { PositionConfig } from "../src/resources/position";
import { TradePlan } from "./strategy/narrowRangeBar";

export const createOrderSynchronized = async (
    order: AlpacaTradeConfig,
    position: PositionConfig,
    orderStatus = OrderStatus.new
): Promise<Order | null> => {
    const openOrders = await getOpenOrders();

    if (!openOrders?.length) {
        return insertOrder(order, position, orderStatus);
    }

    const openOrderForSymbol = openOrders.filter(
        (o) => o.symbol === order.symbol
    );

    if (openOrderForSymbol.length) {
        return null;
    }

    return insertOrder(order, position, orderStatus);
};

export const convertPlanToAlpacaBracketOrder = (
    plan: TradePlan,
    order: Order
): AlpacaTradeConfig => {
    const order_class = "bracket";
    const client_order_id = order.id.toString();

    const type =
        plan.entry === plan.limit ? TradeType.limit : TradeType.stop_limit;

    return {
        order_class,
        client_order_id,
        symbol: plan.symbol,
        stop_loss: {
            stop_price: plan.stop,
        },
        take_profit: {
            limit_price: plan.target,
        },
        stop_price: type === TradeType.limit ? undefined : plan.entry,
        limit_price: plan.limit,
        type,
        time_in_force: TimeInForce.day,
        side:
            plan.direction === PositionDirection.short
                ? TradeDirection.sell
                : TradeDirection.buy,
        extended_hours: false,
        qty: Math.abs(plan.quantity),
    };
};

export const createBracketOrder = (
    order: AlpacaTradeConfig
): Promise<AlpacaOrder> => {
    if (!order.qty || order.qty < 0) {
        throw new Error("quantity_required");
    }
    return alpaca.createOrder(order);
};
