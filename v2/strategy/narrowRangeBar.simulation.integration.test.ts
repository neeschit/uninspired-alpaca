import { NarrowRangeBarSimulation } from "./narrowRangeBar.simulation";
import { batchInsertDailyBars } from "../../src/resources/stockData";
import { cancelOpenOrdersForSymbol } from "../trade-management-api/trade-manager.handlers";
import { createOrderSynchronized } from "../trade-management-helpers/order";
import { getCalendar } from "../brokerage-helpers/alpaca";

jest.mock("../../src/resources/stockData", () => {
    const module = jest.requireActual("../../src/resources/stockData");
    return {
        ...module,
        batchInsertDailyBars: jest.fn(),
    };
});
jest.mock("../trade-management-api/trade-manager.handlers", () => {
    const module = jest.requireActual(
        "../trade-management-api/trade-manager.handlers"
    );

    return {
        ...module,
        cancelOpenOrdersForSymbol: jest.fn(),
    };
});
jest.mock("../trade-management-helpers");

const mockBrokerage = {
    closePosition: jest.fn(),
    createBracketOrder: jest.fn(),
    getOpenPositions: jest.fn(),
    getOpenOrders: jest.fn(),
    cancelAlpacaOrder: jest.fn(),
};

const mockBackInsertDailyBars = batchInsertDailyBars as jest.Mock;
const mockCancelOpenOrders = cancelOpenOrdersForSymbol as jest.Mock;
const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;
const mockCreateOrder = createOrderSynchronized as jest.Mock;

test("narrow range bar strategy simulation - if insertion fails", async () => {
    const nrb = new NarrowRangeBarSimulation("TEST", mockBrokerage);

    mockBackInsertDailyBars.mockReset();

    mockBackInsertDailyBars.mockRejectedValueOnce(
        new Error("test_error_inserting")
    );

    await nrb.beforeMarketStarts();
});

test("narrow range bar strategy simulation - after entry time has passed with open position", async () => {
    const nrb = new NarrowRangeBarSimulation("TEST", mockBrokerage);

    mockGetOpenPositions.mockReset();
    mockCancelOpenOrders.mockReset();
    mockGetOpenPositions.mockReturnValueOnce([{ symbol: "TEST" }]);

    await nrb.afterEntryTimePassed();

    expect(mockCancelOpenOrders).not.toHaveBeenCalled();
});

test("narrow range bar strategy simulation - after entry time has passed", async () => {
    const nrb = new NarrowRangeBarSimulation("TEST", mockBrokerage);

    mockGetOpenPositions.mockReset();
    mockGetOpenPositions.mockReturnValueOnce([{ symbol: "TEST1" }]);

    await nrb.afterEntryTimePassed();

    expect(mockCancelOpenOrders).toHaveBeenCalledWith("TEST", mockBrokerage);
});

test("nrb simulation - rebalance", async () => {
    const nrb = new NarrowRangeBarSimulation("QCOM", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();

    mockGetOpenPositions.mockReturnValue([]);

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );

    await nrb.rebalance(calendar, 1608649200000);

    expect(createOrderSynchronized).toHaveBeenCalledWith(
        {
            entry: 145.913521981893,
            limit_price: 145.913521981893,
            quantity: -16,
            side: "short",
            stop: 146.57553087901235,
            symbol: "QCOM",
            target: 144.74227547160498,
        },
        mockBrokerage
    );
});

test("nrb simulation - rebalance when in open position", async () => {
    const nrb = new NarrowRangeBarSimulation("QCOM", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();
    mockCreateOrder.mockReset();

    mockGetOpenPositions.mockReturnValue([{ symbol: "QCOM" }]);

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );
    await nrb.rebalance(calendar, 1608649200000);

    expect(mockCreateOrder).not.toHaveBeenCalled();
});

test("nrb simulation - rebalance when not an nrb", async () => {
    const nrb = new NarrowRangeBarSimulation("AAPL", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();
    mockCreateOrder.mockReset();

    mockGetOpenPositions.mockReturnValue([{ symbol: "QCOM" }]);

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );
    await nrb.rebalance(calendar, 1608649200000);

    expect(mockCreateOrder).not.toHaveBeenCalled();
});
