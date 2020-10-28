import {
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce,
} from "@neeschit/alpaca-trade-api";
import { createOrderSynchronized } from "./order.v2";
import { PositionConfig } from "../src/resources/position";

jest.mock("../src/resources/alpaca");

import * as AlpacaResources from "../src/resources/alpaca";
import { insertOrder } from "../src/resources/order";

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
