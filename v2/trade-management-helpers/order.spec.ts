import {
    PositionDirection,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import {
    convertPlanToAlpacaBracketOrder,
    createOrderSynchronized,
    getOpeningOrderForPlan,
    getOrderById,
    insertOrderForTradePlan,
    PersistedUnfilledOrder,
    updateOrderWithAlpacaId,
    persistPlanAndOrder,
} from "./order";

import { getOpenOrders } from "../brokerage-helpers";
import { TradePlan, persistTradePlan, PersistedTradePlan } from "./position";
import { getConnection } from "../../src/connection/pg";

jest.mock("../brokerage-helpers");

jest.mock("./position");

jest.mock("../../src/connection/pg");

const mockPersist = persistTradePlan as jest.Mock;
const mockGetOpenOrders = getOpenOrders as jest.Mock;
const mockGetConnection = getConnection as jest.Mock;

test("convert to bracket order", async () => {
    const plan: TradePlan = {
        entry: 157.7324020804614,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol: "CCI",
        side: PositionDirection.short,
        quantity: -159,
        target: 156.67480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
        stop_price: plan.entry,
        type: TradeType.stop_limit,
    } as PersistedUnfilledOrder);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toEqual(plan.entry);
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.stop_limit);
});

test("convert to bracket order - 2", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        side: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
        type: TradeType.limit,
    } as PersistedUnfilledOrder);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toBeFalsy();
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.limit);
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

    const order = getOpeningOrderForPlan(plan);

    expect(order.bracket).toBeTruthy();
    expect(order.bracket.target).toEqual(plan.target);
    expect(order.bracket.stop_loss).toEqual(plan.stop);
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

    const order = getOpeningOrderForPlan(plan);

    expect(order.bracket).toBeTruthy();
    expect(order.bracket.target).toEqual(plan.target);
    expect(order.bracket.stop_loss).toEqual(plan.stop);
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

    mockGetOpenOrders.mockReturnValueOnce([
        { symbol: "TEST", side: TradeDirection.buy },
    ]);

    await expect(createOrderSynchronized(plan)).rejects.toThrowError(
        new Error("order_exists")
    );
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

    await expect(createOrderSynchronized(plan)).rejects.toThrow();
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

    const result = await insertOrderForTradePlan({
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
    });

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

                console.log(lowercaseQs);

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

    await expect(persistPlanAndOrder(plan)).rejects.toThrowError(
        "order_insertion_failed"
    );

    mockGetConnection.mockReset();
});
