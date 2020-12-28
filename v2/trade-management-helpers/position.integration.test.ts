import { PositionDirection } from "@neeschit/alpaca-trade-api";
import { endPooledConnection } from "../../libs/core-utils/connection/pg";
import { persistTradePlan } from "./position";

test("trade_plan insert", async () => {
    const insertResult = await persistTradePlan({
        stop: 100,
        target: 102,
        entry: 101,
        limit_price: 101,
        quantity: -100,
        symbol: "TEST",
        side: PositionDirection.short,
    });

    expect(insertResult.id).toBeGreaterThan(0);
    expect(insertResult.created_at).toBeTruthy();
    expect(insertResult.updated_at).toBeTruthy();
    expect(insertResult.quantity).toEqual(100);
});

afterAll(() => {
    endPooledConnection();
});
