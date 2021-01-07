import {
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import {
    convertPersistedOrderToAlpacaOrder,
    createOrderSynchronized,
    getBracketOrderForPlan,
    getOrderById,
    insertOrderForTradePlan,
    PersistedUnfilledOrder,
    updateOrderWithAlpacaId,
    persistPlan,
    persistOrderForPlan,
    UnfilledOrderAssociatedWithPlan,
} from "./order";

import { TradePlan, persistTradePlan, PersistedTradePlan } from "./position";
import { getConnection } from "../core-utils/connection/pg";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";

jest.mock("./position");

jest.mock("../core-utils/connection/pg");

const mockPersist = persistTradePlan as jest.Mock;
const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;
const mockGetConnection = getConnection as jest.Mock;

test("convert to alpaca order", async () => {
    const plan: TradePlan = {
        entry: 157.7324020804614,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol: "CCI",
        side: PositionDirection.short,
        quantity: -159,
        target: 156.67480416092283,
    };

    const bracketOrder = getBracketOrderForPlan(plan);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toEqual(plan.entry);
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.type).toEqual(TradeType.stop_limit);
});

test("convert to alpaca order - 2", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    const bracketOrder = getBracketOrderForPlan(plan);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toBeFalsy();
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.type).toEqual(TradeType.limit);
});

test("convert to alpaca order - 3", async () => {
    const plan: TradePlan = {
        entry: -1,
        limit_price: -1,
        stop: -1,
        symbol: "CCI",
        side: PositionDirection.long,
        quantity: -159,
        target: 158.77480416092283,
    };

    const bracketOrder = convertPersistedOrderToAlpacaOrder({
        quantity: plan.quantity,
        symbol: plan.symbol,
        order_class: "simple",
        side: TradeDirection.buy,
        take_profit: {
            limit_price: plan.target,
        },
        trade_plan_id: 2,
        type: TradeType.market,
        created_at: "",
        updated_at: "",
        tif: TimeInForce.day,
        id: 2,
    });

    expect(bracketOrder.order_class).toEqual("simple");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toEqual(undefined);
    expect(bracketOrder.stop_price).toBeFalsy();
    expect(bracketOrder.limit_price).toEqual(undefined);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.market);
});

test("convert persisted plan opening order", async () => {
    const plan: PersistedTradePlan = {
        id: 1,
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
        created_at: "11",
        updated_at: "11",
    };

    const order = getBracketOrderForPlan(plan);

    expect(order.take_profit).toBeTruthy();
    expect(order.stop_loss).toBeTruthy();
    expect(order.take_profit?.limit_price).toEqual(plan.target);
    expect(order.stop_loss?.stop_price).toEqual(plan.stop);
    expect(order.stop_price).toBeFalsy();
    expect(order.limit_price).toEqual(plan.limit_price);
    expect(order.quantity).toBeGreaterThan(0);
    expect(order.type).toEqual(TradeType.limit);
});
test("convert persisted plan opening order", async () => {
    const plan: PersistedTradePlan = {
        id: 1,
        entry: 157.73973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        side: PositionDirection.short,
        quantity: 159,
        target: 158.77480416092283,
        created_at: "11",
        updated_at: "11",
    };

    const order = getBracketOrderForPlan(plan);

    expect(order.take_profit).toBeTruthy();
    expect(order.stop_loss).toBeTruthy();
    expect(order.take_profit?.limit_price).toEqual(plan.target);
    expect(order.stop_loss?.stop_price).toEqual(plan.stop);
    expect(order.stop_price).toEqual(plan.entry);
    expect(order.limit_price).toEqual(plan.limit_price);
    expect(order.quantity).toBeGreaterThan(0);
    expect(order.type).toEqual(TradeType.stop_limit);
});

test("createOrderSynchronized - mocked", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "TEST",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    const mockOrder = getBracketOrderForPlan(plan);

    mockGetOpenOrders.mockReturnValueOnce([
        { symbol: "TEST", side: TradeDirection.buy },
    ]);

    await expect(
        createOrderSynchronized(plan, mockOrder, mockBrokerage)
    ).rejects.toThrowError(new Error("order_exists"));
});

test("createOrderSynchronized - mocked with dupe order", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "TEST",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    mockGetOpenOrders.mockReturnValueOnce([]);

    mockPersist.mockReturnValueOnce(
        Object.assign(
            {
                id: 1,
            },
            plan
        )
    );

    const unfilledOrder = getBracketOrderForPlan(plan);

    await expect(
        createOrderSynchronized(plan, unfilledOrder, mockBrokerage)
    ).rejects.toThrow();
});

test("getOrderById - no results", async () => {
    const id = 320;

    mockGetConnection.mockImplementationOnce(() => {
        return {
            query: () => {
                return {
                    rowCount: 0,
                };
            },
        };
    });

    const result = await getOrderById(320);

    expect(result).toBeFalsy();
});

test("getOrderById - with results", async () => {
    const id = 320;

    mockGetConnection.mockImplementationOnce(() => {
        return {
            query: () => {
                return {
                    rowCount: 1,
                    rows: [
                        {
                            test: true,
                        },
                    ],
                };
            },
        };
    });
    const result = await getOrderById(320);

    expect(result).toBeTruthy();
});

test("updateOrderWithAlpacaId", async () => {
    let expectedFailureThrown = false;
    mockGetConnection.mockImplementationOnce(() => {
        return {
            query: (qs: string) => {
                if (qs.indexOf("unknown_failure") === -1) {
                    expectedFailureThrown = true;
                    throw new Error("test_error");
                }
                return {
                    rowCount: 0,
                    rows: [],
                };
            },
        };
    });
    expect(expectedFailureThrown).toBeFalsy();

    await updateOrderWithAlpacaId(1, "new");

    expect(expectedFailureThrown).toBeTruthy();
});

test("insertOrderForTradePlan", async () => {
    mockGetConnection.mockImplementationOnce(() => {
        return {
            query: (qs: string) => {
                throw new Error("test_error");
            },
        };
    });
    const plan = {
        id: 1,
        side: PositionDirection.long,
        stop: 100,
        symbol: "test",
        entry: 101,
        target: 110,
        created_at: "",
        updated_at: "",
        limit_price: 101.1,
        quantity: 100,
    };
    const unfilledOrder = getBracketOrderForPlan(plan);

    const result = await insertOrderForTradePlan(plan, unfilledOrder);

    expect(result).toBeFalsy();
});

test("persistPlanAndOrder", async () => {
    const plan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "TEST",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };
    mockGetConnection.mockImplementation(() => {
        return {
            query: (qs: string) => {
                const lowercaseQs = qs.toLowerCase();

                return {
                    rowCount: 0,
                    rows: [],
                };
            },
        };
    });

    mockPersist.mockReturnValueOnce({
        ...plan,
        id: 1,
    });

    const persistedPlan = await persistPlan(plan);

    const unfilledOrder: UnfilledOrderAssociatedWithPlan = {
        trade_plan_id: persistedPlan.id,
        symbol: persistedPlan.symbol,
        order_class: "simple",
        side: TradeDirection.buy,
        type: TradeType.stop,
        tif: TimeInForce.day,
        quantity: 100,
        limit_price: persistedPlan.limit_price,
        stop_price: persistedPlan.entry,
    };

    await expect(
        persistOrderForPlan(persistedPlan, unfilledOrder)
    ).rejects.toThrowError("order_insertion_failed");

    mockGetConnection.mockReset();
});
