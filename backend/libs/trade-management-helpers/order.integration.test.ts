import {
    AlpacaOrder,
    PositionDirection,
    TradeDirection,
} from "@neeschit/alpaca-trade-api";
import {
    cancelOpenOrdersForSymbol,
    createOrderSynchronized,
    insertOrderForTradePlan,
    selectAllNewOrders,
    updateOrderWithAlpacaId,
} from "./order";
import { persistTradePlan, TradePlan } from "./position";
import { readJsonSync } from "fs-extra";
import {
    endPooledConnection,
    getConnection,
} from "../core-utils/connection/pg";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { getPersistedData } from "../core-utils/resources/stockData";
import { getMarketOpenMillis } from "../simulation-helpers/timing.util";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";

/**
 * Bit of a flaky mechanism as I'm actually hitting the database.
 * Reminder here that the symbol varies per test and any failure should
 * be investigated to figure out if the symbol was the same in the entire
 * test setup
 */

const symbolName = "OINT_";

const mockCancel = mockBrokerage.cancelAlpacaOrder as jest.Mock;

const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

const mockCreateBracketOrder = mockBrokerage.createBracketOrder as jest.Mock;

const mockCancelAlpacaOrder = mockBrokerage.cancelAlpacaOrder as jest.Mock;

const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

const getPlan = (index: number) => ({
    entry: 157.66973888123042,
    limit_price: 157.66973888123042,
    stop: 156.79,
    symbol: symbolName + index,
    side: PositionDirection.long,
    quantity: 159,
    target: 158.77480416092283,
});

test("crud plan and order in database", async () => {
    const plan = getPlan(0);
    const insertedPlan = await persistTradePlan(plan);

    const insertedOrder = await insertOrderForTradePlan(insertedPlan);

    const orders = await selectAllNewOrders(plan.symbol);

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
    const plan = getPlan(1);
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
    const plan = getPlan(2);
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
    const plan = getPlan(3);
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    mockGetOpenOrders.mockReturnValueOnce([]);
    const order = await createOrderSynchronized(plan, mockBrokerage);

    expect(order).toBeTruthy();
    expect(order?.qty).toEqual(Math.abs(plan.quantity).toString());
});

test("createOrderSynchronized - concurrent", async () => {
    const plan = getPlan(4);
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    mockGetOpenOrders.mockReturnValueOnce([]);
    mockGetOpenPositions.mockReturnValue([]);

    const promise = () =>
        new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const mockResult = JSON.parse(JSON.stringify(alpacaResult));
                    mockResult.id += 1;
                    mockGetOpenOrders.mockReturnValueOnce([]);
                    await expect(
                        createOrderSynchronized(plan, mockBrokerage)
                    ).rejects.toThrow();

                    resolve({});
                } catch (e) {
                    reject(e);
                }
            }, 10);
        });

    const orders = await Promise.all([
        createOrderSynchronized(plan, mockBrokerage),
        promise(),
    ]);

    const order = orders[0];

    expect(order).toBeTruthy();
    expect(order?.qty).toEqual(Math.abs(plan.quantity).toString());
});

test("createOrderSynchronized - mocked short that does cancel existing order", async () => {
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    const symbol = symbolName + 5;

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol,
        side: PositionDirection.short,
        quantity: 159,
        target: 155.77480416092283,
    };

    mockGetOpenOrders.mockReset();

    mockGetOpenOrders.mockReturnValueOnce([
        { symbol, side: TradeDirection.buy },
    ]);

    mockCancelAlpacaOrder.mockClear();

    mockCancelAlpacaOrder.mockReturnValueOnce(true);

    mockGetOpenPositions.mockReturnValueOnce([]);

    const order = await createOrderSynchronized(plan, mockBrokerage);

    expect(mockCancelAlpacaOrder.mock.calls.length).toEqual(1);

    mockGetOpenOrders.mockReset();

    expect(order).toBeTruthy();
});

test("createOrderSynchronized - with error creating bracket order", async () => {
    const plan = getPlan(6);
    mockCreateBracketOrder.mockReset();
    mockCreateBracketOrder.mockRejectedValueOnce(new Error("test_error"));
    mockGetOpenOrders.mockReturnValueOnce([]);
    await expect(
        createOrderSynchronized(plan, mockBrokerage)
    ).rejects.toThrowError("test_error");

    const orders = await selectAllNewOrders(plan.symbol);

    expect(orders?.length).toBeFalsy();
});
test("createOrderSynchronized - tiny delay", async () => {
    const plan = getPlan(7);
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    mockCreateBracketOrder.mockReset();
    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    mockGetOpenOrders.mockReturnValueOnce([]);

    const promise = () =>
        new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const mockResult = JSON.parse(JSON.stringify(alpacaResult));

                    mockResult.id += Date.now();
                    mockGetOpenOrders.mockReturnValueOnce([]);
                    mockCreateBracketOrder.mockResolvedValueOnce(mockResult);
                    await expect(
                        createOrderSynchronized(plan, mockBrokerage)
                    ).rejects.toThrowError("order_placed_recently_for_symbol");

                    resolve({});
                } catch (e) {
                    reject(e);
                }
            }, 150);
        });

    const orders = await Promise.all([
        createOrderSynchronized(plan, mockBrokerage),
        promise(),
    ]);

    const order = orders[0];

    expect(order).toBeTruthy();
    expect(order?.qty).toEqual(Math.abs(plan.quantity).toString());
});

test("createOrderSynchronized - mocked short that doesn't cancel existing order due to open position", async () => {
    const alpacaResult: AlpacaOrder = readJsonSync(
        "./fixtures/alpaca-order-response.json"
    ) as any;

    alpacaResult.id += Date.now();

    const symbol = symbolName + 8;

    mockCreateBracketOrder.mockResolvedValueOnce(alpacaResult);
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol,
        side: PositionDirection.short,
        quantity: 159,
        target: 155.77480416092283,
    };

    mockGetOpenOrders.mockReset();

    mockGetOpenOrders.mockReturnValueOnce([
        { symbol, side: TradeDirection.buy },
    ]);

    mockCancelAlpacaOrder.mockClear();

    mockCancelAlpacaOrder.mockReturnValueOnce(true);

    mockGetOpenPositions.mockReturnValueOnce([
        {
            symbol,
        },
    ]);

    await expect(
        createOrderSynchronized(plan, mockBrokerage)
    ).rejects.toThrowError("position_exists");

    expect(mockCancelAlpacaOrder.mock.calls.length).toEqual(0);

    mockGetOpenOrders.mockReset();
});

test("getPersistedData for VZ", async () => {
    const calendar = await getCalendar(
        new Date(1603895400000),
        new Date(1603895400000)
    );
    const marketOpenMillis = getMarketOpenMillis(calendar, 1603895400000);
    const { data, lastBar } = await getPersistedData(
        "VZ",
        marketOpenMillis,
        1603895400000
    );

    expect(data.length).toEqual(12);
    expect(Math.round(lastBar.c * 100)).toEqual(5685);
});

test("cancelOpenOrdersAfterEntryTimePassed - order to cancel", async () => {
    const symbol = "TEST";

    mockGetOpenOrders.mockResolvedValueOnce([{ symbol, id: 2 }]);

    await cancelOpenOrdersForSymbol(symbol, mockBrokerage);

    expect(mockCancel).toHaveBeenCalledWith(2);
});

test("cancelOpenOrdersAfterEntryTimePassed - no cancel", async () => {
    const symbol = "TEST";

    mockGetOpenOrders.mockResolvedValueOnce([]);

    await cancelOpenOrdersForSymbol(symbol, mockBrokerage);

    expect(mockCancel).not.toHaveBeenCalled();
});

afterAll(async () => {
    endPooledConnection();
});
