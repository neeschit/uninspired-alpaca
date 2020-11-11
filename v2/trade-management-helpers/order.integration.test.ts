import { AlpacaOrder, PositionDirection } from "@neeschit/alpaca-trade-api";
import {
    createOrderSynchronized,
    insertOrderForTradePlan,
    selectAllNewOrders,
    updateOrderWithAlpacaId,
} from "./order";
import { persistTradePlan, TradePlan } from "./position";
import { getOpenOrders, createBracketOrder } from "../brokerage-helpers";
import { readJsonSync } from "fs-extra";
import { endPooledConnection } from "../../src/connection/pg";

jest.mock("../brokerage-helpers");

const mockGetOpenOrders = getOpenOrders as jest.Mock;

const mockCreateBracketOrder = createBracketOrder as jest.Mock;

const plan: TradePlan = {
    entry: 157.66973888123042,
    limit_price: 157.66973888123042,
    stop: 156.79,
    symbol: "ORDER",
    direction: PositionDirection.long,
    quantity: 159,
    target: 158.77480416092283,
};

test("crud plan and order in database", async () => {
    const insertedPlan = await persistTradePlan(plan);

    const insertedOrder = await insertOrderForTradePlan(insertedPlan);

    const orders = await selectAllNewOrders();

    expect(orders?.length).toEqual(1);
    if (insertedOrder) {
        await updateOrderWithAlpacaId(
            insertedOrder.id,
            "ORDER" + Date.now().toString()
        );
    }
    expect(insertedOrder).toBeTruthy();
});

test("crud plan and order in database with a dupe not concurrent", async () => {
    const insertedPlan = await persistTradePlan(plan);

    const insertedOrder = await insertOrderForTradePlan(insertedPlan);

    expect(insertedOrder).toBeTruthy();

    const insertedOrder1 = await insertOrderForTradePlan(insertedPlan);

    expect(insertedOrder1).toBeFalsy();

    if (insertedOrder) {
        await updateOrderWithAlpacaId(
            insertedOrder.id,
            "ORDER" + Date.now().toString()
        );
    }
});

test("crud plan and order in database with a dupe - concurrent", async () => {
    const insertedPlan = await persistTradePlan(plan);

    const results = await Promise.all([
        insertOrderForTradePlan(insertedPlan),
        insertOrderForTradePlan(insertedPlan),
    ]);

    const order = results.filter((r) => r);

    expect(order.length).toEqual(1);

    await updateOrderWithAlpacaId(
        order[0]!.id,
        "ORDER" + Date.now().toString()
    );
});

test("createOrderSynchronized", async () => {
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    mockGetOpenOrders.mockReturnValueOnce([]);
    const order = await createOrderSynchronized(plan);

    expect(order).toBeTruthy();
    expect(order?.qty).toEqual(Math.abs(plan.quantity).toString());
});

test("createOrderSynchronized", async () => {
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockRejectedValueOnce(new Error("test_error"));
    mockGetOpenOrders.mockReturnValueOnce([]);
    await expect(createOrderSynchronized(plan)).rejects.toThrow();

    const orders = await selectAllNewOrders();

    expect(orders?.length).toBeFalsy();
});

afterAll(async () => {
    endPooledConnection();
});
