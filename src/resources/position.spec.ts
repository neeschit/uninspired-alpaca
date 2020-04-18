import test from "ava";
import { insertPlannedPosition } from "./position";
import { PositionDirection } from "../data/data.model";

test.skip("insert position into database and generates position id", async (t) => {
    const result = await insertPlannedPosition({
        plannedEntryPrice: 300,
        plannedStopPrice: 290,
        symbol: "AAPL",
        quantity: 10,
        side: PositionDirection.long,
        riskAtrRatio: 2,
    });

    t.truthy(result.id);
});
