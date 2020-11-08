import {
    TradeType,
    TimeInForce,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import {
    createBracketOrder,
    getOpenOrders,
    alpaca,
    getOpenPositions,
} from "./alpaca";

const symbol = "ARWR";

test("create bracket order", async () => {
    const orderId = "01" + Date.now();
    const order = {
        order_class: "bracket" as any,
        client_order_id: orderId,
        symbol,
        stop_price: 92.924020804614,
        limit_price: 93.65973888123042,
        stop_loss: { stop_price: 91.79 },
        take_profit: { limit_price: 94.67480416092283 },
        type: TradeType.stop_limit,
        time_in_force: TimeInForce.day,
        side: TradeDirection.buy,
        extended_hours: false,
        qty: 159,
    };

    const prevOpenOrders = await getOpenOrders();

    if (prevOpenOrders.some((o) => o.symbol === symbol)) {
        return null;
    }

    const result = await createBracketOrder(order);

    const orders = await getOpenOrders();

    expect(orders.some((o) => o.client_order_id === orderId)).toBeTruthy();

    await alpaca.cancelOrder(result.id);

    const latestOrdersFetch = await getOpenOrders();

    expect(latestOrdersFetch.every((o) => o.client_order_id !== orderId));
});

test("create bracket order - no quantity", async () => {
    const orderId = "01" + Date.now();
    const order = {
        order_class: "bracket" as any,
        client_order_id: orderId,
        symbol,
        stop_price: 77.7324020804614,
        limit_price: 77.66973888123042,
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

test("getOpenPositions in mocked CI mode", async () => {
    const result = await getOpenPositions();

    expect(result).toBeTruthy();
});
