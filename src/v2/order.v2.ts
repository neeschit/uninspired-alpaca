import { AlpacaTradeConfig, OrderStatus } from "@neeschit/alpaca-trade-api";
import { getOpenOrders } from "../resources/alpaca";
import { insertOrder, Order } from "../resources/order";
import { PositionConfig } from "../resources/position";

export const createOrderSynchronized = async (
    order: AlpacaTradeConfig,
    position: PositionConfig,
    orderStatus = OrderStatus.new
): Promise<Order | null> => {
    const openOrders = await getOpenOrders();

    const openOrderForSymbol = openOrders.filter(
        (o) => o.symbol === order.symbol
    );

    if (openOrderForSymbol?.length) {
        return null;
    }

    return insertOrder(order, position, orderStatus);
};
