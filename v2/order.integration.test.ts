import {
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { alpaca, getOpenOrders } from "../src/resources/alpaca";
import { createBracketOrder } from "./order.v2";

test("create bracket order", async () => {
    const orderId = "01" + Date.now();
    const order = {
        order_class: "bracket" as any,
        client_order_id: orderId,
        symbol: "CCI",
        stop_price: 157.7324020804614,
        limit_price: 157.66973888123042,
        stop_loss: { stop_price: 158.79 },
        take_profit: { limit_price: 156.67480416092283 },
        type: TradeType.stop_limit,
        time_in_force: TimeInForce.day,
        side: TradeDirection.sell,
        extended_hours: false,
        qty: 159,
    };

    const result = await createBracketOrder(order);

    const orders = await getOpenOrders(); //?

    expect(orders.some((o) => o.client_order_id === orderId)).toBeTruthy();

    await alpaca.cancelOrder(result.id);

    const latestOrdersFetch = await getOpenOrders();

    expect(orders.every((o) => o.client_order_id !== orderId));
});

test("create bracket order - no quantity", async () => {
    const orderId = "01" + Date.now();
    const order = {
        order_class: "bracket" as any,
        client_order_id: orderId,
        symbol: "CCI",
        stop_price: 157.7324020804614,
        limit_price: 157.66973888123042,
        stop_loss: { stop_price: 158.79 },
        take_profit: { limit_price: 156.67480416092283 },
        type: TradeType.stop_limit,
        time_in_force: TimeInForce.day,
        side: TradeDirection.sell,
        extended_hours: false,
        qty: -159,
    };

    expect(createBracketOrder.bind({}, order)).toThrow();
});
