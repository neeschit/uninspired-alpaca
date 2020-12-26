import { MockBrokerage } from "./mockBrokerage";
import {
    TradeDirection,
    TradeType,
    TimeInForce,
} from "@neeschit/alpaca-trade-api";

const instance = MockBrokerage.getInstance();

beforeEach(() => {
    instance.reset();
});

test("createBracketOrder without stop_loss shoud error", async () => {
    await expect(
        instance.createBracketOrder({
            client_order_id: "test_" + Date.now(),
            symbol: "AAPL",
            qty: 10,
            limit_price: 130.15,
            stop_price: 130.05,
            side: TradeDirection.buy,
            type: TradeType.limit,
            extended_hours: false,
            time_in_force: TimeInForce.day,
            order_class: "bracket",
            take_profit: {
                limit_price: 0,
            },
        })
    ).rejects.toThrow("stop_loss_missing_for_bracket_order");
});

test("createBracketOrder without take_profit shoud error", async () => {
    await expect(
        instance.createBracketOrder({
            client_order_id: "test_" + Date.now(),
            symbol: "AAPL",
            qty: 10,
            limit_price: 130.15,
            stop_price: 130.05,
            side: TradeDirection.buy,
            type: TradeType.limit,
            extended_hours: false,
            time_in_force: TimeInForce.day,
            order_class: "bracket",
            stop_loss: {
                stop_price: 0,
            },
        })
    ).rejects.toThrow("take_profit_missing_for_bracket_order");
});

test("createBracketOrder should create an open order", async () => {
    const orderCreationResponse = await instance.createBracketOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "AAPL",
        qty: 10,
        limit_price: 130.15,
        stop_price: 130.05,
        side: TradeDirection.buy,
        type: TradeType.limit,
        extended_hours: false,
        time_in_force: TimeInForce.day,
        order_class: "bracket",
        stop_loss: {
            stop_price: 0,
        },
        take_profit: {
            limit_price: 0,
        },
    });

    const openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);
});

test("ticking past a long entry price with an open order should create an open position", async () => {
    const orderCreationResponse = await instance.createBracketOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "AAPL",
        qty: 10,
        limit_price: 132.05,
        stop_price: 132.01,
        side: TradeDirection.buy,
        type: TradeType.limit,
        extended_hours: false,
        time_in_force: TimeInForce.day,
        order_class: "bracket",
        stop_loss: {
            stop_price: 131.49,
        },
        take_profit: {
            limit_price: 132.55,
        },
    });

    await instance.tick(1608820500000);

    let openPositions = await instance.getOpenPositions();

    expect(openPositions.length).toEqual(1);

    let openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);

    expect(instance.stopLegs.length).toEqual(1);
    expect(instance.profitLegs.length).toEqual(0);

    await instance.tick(1608821100000);
    openPositions = await instance.getOpenPositions();
    openOrders = await instance.getOpenOrders();

    expect(openPositions.length).toEqual(0);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);
    expect(instance.closedPositions.length).toEqual(1);
});

test("ticking past a long entry price with stop triggered as well", async () => {
    const orderCreationResponse = await instance.createBracketOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "AAPL",
        qty: 10,
        limit_price: 132.05,
        stop_price: 132.01,
        side: TradeDirection.buy,
        type: TradeType.stop_limit,
        extended_hours: false,
        time_in_force: TimeInForce.day,
        order_class: "bracket",
        stop_loss: {
            stop_price: 131.79,
        },
        take_profit: {
            limit_price: 132.55,
        },
    });

    await instance.tick(1608820500000);

    let openPositions = await instance.getOpenPositions();

    expect(openPositions.length).toEqual(1);

    let openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);

    expect(instance.stopLegs.length).toEqual(1);
    expect(instance.profitLegs.length).toEqual(0);

    await instance.tick(1608820560000);
    openPositions = await instance.getOpenPositions();
    openOrders = await instance.getOpenOrders();

    expect(openPositions.length).toEqual(0);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);

    expect(instance.closedPositions.length).toEqual(1);
    const applePosition = instance.closedPositions[0];
    expect(applePosition.entryTime).toEqual("2020-12-24T14:35:00.000Z");
    expect(applePosition.exitTime).toEqual("2020-12-24T14:36:00.000Z");
    expect(applePosition.avg_entry_price).toBeGreaterThanOrEqual(132.01);
    expect(applePosition.avg_entry_price).toBeLessThanOrEqual(132.05);
    expect(applePosition.avg_exit_price).toBeLessThanOrEqual(131.79);

    const closingOrderId = applePosition.orderIds.close;
    const openingOrderId = applePosition.orderIds.open;

    const closedOrders = instance.closedOrders;

    expect(closedOrders.some((o) => o.id === closingOrderId)).toBeTruthy();
    expect(closedOrders.some((o) => o.id === openingOrderId)).toBeTruthy();
});
