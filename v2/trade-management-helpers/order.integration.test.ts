import {
    AlpacaOrder,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import {
    createOrderSynchronized,
    insertOrderForTradePlan,
    selectAllNewOrders,
    updateOrderWithAlpacaId,
} from "./order";
import { persistTradePlan, TradePlan } from "./position";
import {
    getOpenOrders,
    createBracketOrder,
    cancelAlpacaOrder,
} from "../brokerage-helpers";
import { readJsonSync } from "fs-extra";
import { endPooledConnection } from "../../src/connection/pg";

const symbolName = "ORDERINT";

jest.mock("../brokerage-helpers");

const mockGetOpenOrders = getOpenOrders as jest.Mock;

const mockCreateBracketOrder = createBracketOrder as jest.Mock;

const mockCancelAlpacaOrder = cancelAlpacaOrder as jest.Mock;

const plan: TradePlan = {
    entry: 157.66973888123042,
    limit_price: 157.66973888123042,
    stop: 156.79,
    symbol: symbolName,
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
            symbolName + Date.now().toString()
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
            symbolName + Date.now().toString()
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
        symbolName + Date.now().toString()
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

test("createOrderSynchronized - with error creating bracket order", async () => {
    mockCreateBracketOrder.mockRejectedValueOnce(new Error("test_error"));
    mockGetOpenOrders.mockReturnValueOnce([]);
    await expect(createOrderSynchronized(plan)).rejects.toThrow();

    const orders = await selectAllNewOrders();

    expect(orders?.length).toBeFalsy();
});

test("createOrderSynchronized - mocked short that does cancel existing order", async () => {
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol: symbolName,
        direction: PositionDirection.short,
        quantity: 159,
        target: 155.77480416092283,
    };

    mockGetOpenOrders.mockReturnValueOnce([
        { symbol: symbolName, side: TradeDirection.buy },
    ]);

    mockCancelAlpacaOrder.mockReturnValueOnce(true);

    const order = await createOrderSynchronized(plan);

    expect(order).toBeTruthy();
});

afterAll(async () => {
    endPooledConnection();
});
