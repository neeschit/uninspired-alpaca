import { AlpacaTradeConfig, OrderStatus } from "@neeschit/alpaca-trade-api";
import { getOpenOrders } from "../src/resources/alpaca";
import { insertOrder, Order } from "../src/resources/order";
import { PositionConfig } from "../src/resources/position";

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
