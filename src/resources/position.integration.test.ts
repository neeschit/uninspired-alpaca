import test from "ava";
import { insertPlannedPosition, Position, getUpdatePositionQuery } from "./position";
import { PositionDirection, TradeDirection } from "@neeschit/alpaca-trade-api";

test.skip("insert position into database and generates position id", async (t) => {
    const result = await insertPlannedPosition({
        plannedEntryPrice: 300,
        plannedStopPrice: 290,
        symbol: "test",
        quantity: 10,
        side: PositionDirection.long,
        riskAtrRatio: 2,
    });

    t.truthy(result.id);
});

test("update position should change entry price in db", async (t) => {
    const position: Position = {
        id: 1,
        planned_entry_price: 200,
        planned_stop_price: 100,
        planned_quantity: 100,
        quantity: 0,
        symbol: "test",
        side: TradeDirection.buy,
        average_entry_price: 0,
    };

    const query = getUpdatePositionQuery(position, 100, 200.05);

    t.truthy(query.indexOf("average_entry_price") !== -1);
});

test("update position should not change entry price in db", async (t) => {
    const position: Position = {
        id: 1,
        planned_entry_price: 200,
        planned_stop_price: 100,
        planned_quantity: 100,
        quantity: 100,
        symbol: "test",
        side: TradeDirection.buy,
        average_entry_price: 0,
    };

    const query = getUpdatePositionQuery(position, 0, 99.95);

    t.truthy(query.indexOf("average_entry_price") === -1);
});
