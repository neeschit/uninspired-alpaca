import test from "ava";
import { insertPlannedPosition } from "./position";
import { insertOrder, cancelAllOrdersForSymbol } from "./order";
import {
    PositionDirection,
    TradeDirection,
    TimeInForce,
    TradeType,
} from "@neeschit/alpaca-trade-api";

test("multiple orders for same position result in single order", async (t) => {
    const position = await insertPlannedPosition({
        plannedEntryPrice: 200,
        plannedStopPrice: 200,
        quantity: 100,
        symbol: "test",
        side: PositionDirection.long,
        riskAtrRatio: 1,
    });

    const position1 = await insertPlannedPosition({
        plannedEntryPrice: 200,
        plannedStopPrice: 200,
        quantity: 100,
        symbol: "test1",
        side: PositionDirection.long,
        riskAtrRatio: 1,
    });

    const orderPromise = insertOrder(
        {
            symbol: "test",
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

    const order2Promise = insertOrder(
        {
            symbol: "test1",
            side: TradeDirection.buy,
            qty: 100,
            stop_price: 200,
            limit_price: 200,
            type: TradeType.market,
            time_in_force: TimeInForce.gtc,
            extended_hours: false,
            order_class: "simple",
        },
        position1
    );

    await new Promise((resolve) => setTimeout(() => resolve(), 0));

    const order1Promise = insertOrder(
        {
            symbol: "test",
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

    const results = await Promise.all([orderPromise, order1Promise, order2Promise]);
    await cancelAllOrdersForSymbol("test");
    await cancelAllOrdersForSymbol("test1");

    t.is(results[1], null);
    t.truthy(results[0]!.id);
    t.truthy(results[2]!.id);
});
