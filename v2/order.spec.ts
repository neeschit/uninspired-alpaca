import {
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce,
} from "@neeschit/alpaca-trade-api";
import {
    convertPlanToAlpacaBracketOrder,
    createOrderSynchronized,
} from "./order.v2";
import { PositionConfig } from "../src/resources/position";

jest.mock("../src/resources/alpaca");

import * as AlpacaResources from "../src/resources/alpaca";
import { insertOrder, Order } from "../src/resources/order";
import { TradePlan } from "./strategy/narrowRangeBar";

jest.mock("../src/resources/order");

const mockGetOpenOrders = <jest.Mock>AlpacaResources.getOpenOrders;
const mockInsertOrder = <jest.Mock>insertOrder;

const position: PositionConfig = {
    plannedEntryPrice: 200,
    plannedStopPrice: 200,
    quantity: 100,
    symbol: "VZ",
    side: PositionDirection.long,
    riskAtrRatio: 1,
    originalQuantity: 100,
    id: 1,
};

test("simple create order", async () => {
    mockInsertOrder.mockResolvedValueOnce({
        id: 1,
    });
    const order = await createOrderSynchronized(
        {
            symbol: "VZ",
            side: TradeDirection.buy,
            qty: 100,
            stop_price: 200,
            limit_price: 200,
            type: TradeType.market,
            time_in_force: TimeInForce.gtc,
            extended_hours: false,
            order_class: "simple",
        },
        position
    );

    expect(order).toBeTruthy();
});

test("simple create order with unrelated pending", async () => {
    mockGetOpenOrders.mockReturnValue([
        {
            symbol: "Z",
        },
    ]);
    mockInsertOrder.mockResolvedValueOnce({
        id: 1,
    });

    const order = await createOrderSynchronized(
        {
            symbol: "VZ",
            side: TradeDirection.buy,
            qty: 100,
            stop_price: 200,
            limit_price: 200,
            type: TradeType.market,
            time_in_force: TimeInForce.gtc,
            extended_hours: false,
            order_class: "simple",
        },
        position
    );

    expect(order).toBeTruthy();
});

test("create order with an open order already existing", async () => {
    mockGetOpenOrders.mockReturnValue([
        {
            symbol: "VZ",
        },
    ]);
    const order = await createOrderSynchronized(
        {
            symbol: "VZ",
            side: TradeDirection.buy,
            qty: 100,
            stop_price: 200,
            limit_price: 200,
            type: TradeType.market,
            time_in_force: TimeInForce.gtc,
            extended_hours: false,
            order_class: "simple",
        },
        position
    );

    expect(order).toBeFalsy();
});

test("convert to bracket order", async () => {
    const plan: TradePlan = {
        entry: 157.7324020804614,
        limit: 157.66973888123042,
        stop: 158.79,
        symbol: "CCI",
        direction: PositionDirection.short,
        quantity: -159,
        target: 156.67480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
    } as Order);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toEqual(plan.entry);
    expect(bracketOrder.limit_price).toEqual(plan.limit);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.stop_limit);
});

test("convert to bracket order - 2", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        direction: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
    } as Order);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toBeFalsy();
    expect(bracketOrder.limit_price).toEqual(plan.limit);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.limit);
});
