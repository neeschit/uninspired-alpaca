import {
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce,
} from "@neeschit/alpaca-trade-api";
import { createOrderSynchronized } from "./order.v2";
import { PositionConfig } from "../resources/position";

jest.mock("../resources/alpaca");

import * as AlpacaResources from "../resources/alpaca";

jest.mock("../resources/order");

const mockGetOpenOrders = <jest.Mock>AlpacaResources.getOpenOrders;

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
    mockGetOpenOrders.mockReturnValue([
        {
            symbol: "ABC",
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
