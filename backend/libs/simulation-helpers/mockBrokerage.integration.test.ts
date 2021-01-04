import { isOrderFillable, MockBrokerage } from "./mockBrokerage";
import {
    TradeDirection,
    TradeType,
    TimeInForce,
    PositionDirection,
    OrderStatus,
} from "@neeschit/alpaca-trade-api";

const instance = new MockBrokerage();

beforeEach(() => {
    instance.reset();
});

jest.setTimeout(10000);

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
    expect(openOrders.length).toEqual(0);
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
    expect(applePosition.side).toEqual(PositionDirection.long);
    expect(applePosition.averageEntryPrice).toBeGreaterThanOrEqual(132.01);
    expect(applePosition.averageEntryPrice).toBeLessThanOrEqual(132.05);
    expect(applePosition.averageExitPrice).toBeLessThanOrEqual(131.79);

    const closingOrderId = applePosition.orderIds.close;
    const openingOrderId = applePosition.orderIds.open;

    const closedOrders = instance.closedOrders;

    expect(closedOrders.some((o) => o.id === closingOrderId)).toBeTruthy();
    expect(closedOrders.some((o) => o.id === openingOrderId)).toBeTruthy();
});

test("ticking past a short entry price with an open order should create an open position", async () => {
    await instance.createBracketOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "BABA",
        qty: 10,
        limit_price: 227.9,
        stop_price: 227.98,
        side: TradeDirection.sell,
        type: TradeType.stop_limit,
        extended_hours: false,
        time_in_force: TimeInForce.day,
        order_class: "bracket",
        stop_loss: {
            stop_price: 229,
        },
        take_profit: {
            limit_price: 226,
        },
    });

    let openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);
    expect(instance.stopLegs.length).toEqual(1);
    expect(instance.profitLegs.length).toEqual(1);

    await instance.tick(1608820320000);

    let openPositions = await instance.getOpenPositions();

    expect(openPositions.length).toEqual(1);
    const position = openPositions[0];
    expect(position.side).toEqual(PositionDirection.short);
    expect(instance.stopLegs.length).toEqual(1);
    expect(instance.profitLegs.length).toEqual(0);

    await instance.tick(1608820440000);
    openPositions = await instance.getOpenPositions();
    openOrders = await instance.getOpenOrders();

    expect(openPositions.length).toEqual(0);
    expect(instance.stopLegs.length).toEqual(0);
    expect(openOrders.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);
    expect(instance.closedPositions.length).toEqual(1);
    const closedPosition = instance.closedPositions[0];
    expect(closedPosition.side).toEqual(PositionDirection.short);
});

test("multiple open orders at the same time", async () => {
    await instance.createBracketOrder({
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
            stop_price: 131.49,
        },
        take_profit: {
            limit_price: 132.55,
        },
    });

    await instance.createBracketOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "WFC",
        qty: 10,
        limit_price: 29.97,
        stop_price: 29.99,
        side: TradeDirection.sell,
        type: TradeType.stop_limit,
        extended_hours: false,
        time_in_force: TimeInForce.day,
        order_class: "bracket",
        stop_loss: {
            stop_price: 30.1,
        },
        take_profit: {
            limit_price: 29.83,
        },
    });

    let openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(2);

    await instance.tick(1608820500000);

    let openPositions = await instance.getOpenPositions();

    expect(openPositions.length).toEqual(2);
    expect(instance.stopLegs.length).toEqual(2);
    expect(instance.profitLegs.length).toEqual(0);

    await instance.tick(1608821100000);
    openPositions = await instance.getOpenPositions();
    openOrders = await instance.getOpenOrders();

    expect(openPositions.length).toEqual(1);
    expect(openOrders.length).toEqual(1);
    expect(instance.stopLegs.length).toEqual(1);
    expect(instance.profitLegs.length).toEqual(0);
    expect(instance.closedPositions.length).toEqual(1);

    await instance.tick(1608821280000);

    openPositions = await instance.getOpenPositions();
    openOrders = await instance.getOpenOrders();

    expect(openPositions.length).toEqual(0);
    expect(openOrders.length).toEqual(0);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);
    expect(instance.closedPositions.length).toEqual(2);
    expect(instance.closedOrders.length).toEqual(4);
});

test("create oto market order on open", async () => {
    const order = await instance.createOneTriggersAnotherOrder({
        client_order_id: "test_" + Date.now(),
        symbol: "SPY",
        qty: 10,
        side: TradeDirection.sell,
        type: TradeType.market,
        extended_hours: false,
        time_in_force: TimeInForce.opg,
        order_class: "oto",
        take_profit: {
            limit_price: 372.14,
        },
    });

    let openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(1);

    const marketOpen12292020 = 1609252200000;
    await instance.tick(marketOpen12292020);

    openOrders = await instance.getOpenOrders();

    expect(openOrders.length).toEqual(1);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);

    const closedOrders = instance.closedOrders;

    expect(closedOrders[0].filled_avg_price).toEqual(373.81);

    await instance.tick(1609254720000); // 10:12 am 12/29

    openOrders = await instance.getOpenOrders();
    expect(openOrders.length).toEqual(0);
    expect(instance.stopLegs.length).toEqual(0);
    expect(instance.profitLegs.length).toEqual(0);
    expect(closedOrders[1].filled_avg_price).toEqual(372.14);
});

test("order filling test", () => {
    const params = {
        isCurrentPosition: false,
        isShort: false,
        minuteBar: {
            v: 2403,
            c: 143.1078,
            o: 143.2,
            h: 143.225,
            l: 143.1078,
            t: 1608739560000,
        },
        order: {
            id: "1df4d3fa-9a3f-4e4b-8a8c-2ad33c013e2f",
            client_order_id: "1609296412610.9492",
            created_at: "2020-12-23T16:02:00.000Z",
            updated_at: "2020-12-23T16:02:00.000Z",
            submitted_at: "2020-12-23T16:02:00.000Z",
            filled_at: "2020-12-23T16:05:00.000Z",
            expired_at: "2020-12-23T16:02:00.000Z",
            canceled_at: "2020-12-23T16:02:00.000Z",
            failed_at: "2020-12-23T16:02:00.000Z",
            asset_id: "",
            symbol: "VMW",
            asset_class: "",
            qty: 15,
            filled_qty: 15,
            type: TradeType.limit,
            side: TradeDirection.buy,
            time_in_force: TimeInForce.day,
            limit_price: 142.09322310442667,
            stop_price: undefined,
            filled_avg_price: 142.09322310442667,
            status: OrderStatus.new,
            extended_hours: false,
            associatedOrderIds: {
                takeProfit: "71ad4988-a0ce-4c82-96b8-c7f96a62d5c0",
                stopLoss: "8c99f8f8-273d-421c-9fb9-25b4682fa7a9",
            },
        },
        openPositions: [
            {
                id: "ef4c7b9a-d0e1-4fb1-944a-c83711243dc9",
                side: PositionDirection.long,
                symbol: "SPY",
                qty: "4",
                asset_class: "",
                asset_id: "",
                avg_entry_price: "368.793326327572",
                market_value: "",
                cost_basis: "",
                unrealized_intraday_pl: "",
                lastday_price: "",
                current_price: "368.98",
                exchange: "",
                unrealized_intraday_plpc: "",
                unrealized_pl: "",
                unrealized_plpc: "",
                change_today: "",
                orderIds: {
                    stopLoss: "",
                    takeProfit: "",
                },
            },
            {
                id: "a317c46b-b5e0-478f-b137-87964ca99f6a",
                side: PositionDirection.long,
                symbol: "XOM",
                qty: "29",
                asset_class: "",
                asset_id: "",
                avg_entry_price: "41.83089216131687",
                market_value: "",
                cost_basis: "",
                unrealized_intraday_pl: "",
                lastday_price: "",
                current_price: "42.09",
                exchange: "",
                unrealized_intraday_plpc: "",
                unrealized_pl: "",
                unrealized_plpc: "",
                change_today: "",
                orderIds: {
                    stopLoss: "",
                    takeProfit: "",
                },
            },
        ],
        strikePrice: 142.09322310442667,
    };

    expect(
        isOrderFillable(
            params.isCurrentPosition,
            params.isShort,
            params.minuteBar,
            params.order,
            params.openPositions,
            params.strikePrice
        )
    ).toEqual(false);
});
