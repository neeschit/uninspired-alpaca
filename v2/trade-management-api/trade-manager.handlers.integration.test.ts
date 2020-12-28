import {
    cancelOpenOrdersForSymbol,
    getPersistedData,
    rebalanceForSymbol,
} from "./trade-manager.handlers";
import { getWatchlistFromScreenerService } from "../screener-api/screener.interfaces.js";
import { createOrderSynchronized } from "../trade-management-helpers/order.js";
import { endPooledConnection } from "../../src/connection/pg.js";
import { CachedCalendar } from "../orchestrator-service/orchestrator.js";
import { getCalendar } from "../brokerage-helpers/alpaca.js";

jest.mock("../screener-api");

jest.mock("../trade-management-helpers");

const mockBrokerage = {
    closePosition: jest.fn(),
    createBracketOrder: jest.fn(),
    getOpenPositions: jest.fn(),
    getOpenOrders: jest.fn(),
    cancelAlpacaOrder: jest.fn(),
};

const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

const mockGetOpenPositions = <jest.Mock>mockBrokerage.getOpenPositions;
const mockCreateOrder = <jest.Mock>createOrderSynchronized;

const mockWatchlist = <jest.Mock>getWatchlistFromScreenerService;
const mockCancel = mockBrokerage.cancelAlpacaOrder as jest.Mock;

jest.setTimeout(25000);

beforeEach(() => {
    mockGetOpenOrders.mockReturnValue([]);
});

afterEach(() => {
    mockGetOpenOrders.mockReset();
    mockCancel.mockClear();
});

afterAll(async () => {
    await endPooledConnection();
});
/* 
test("lookForEntry", async () => {
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }]);
    const result = await lookForEntry("VZ", mockBrokerage);

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist & timing for entry is correct", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    const result = await lookForEntry("VZ", mockBrokerage, 1603895590000);

    expect(result).toBeTruthy();
    expect(result!.symbol).toEqual("VZ");
    expect(result!.entry).not.toEqual(result!.limit_price);
    expect(result!.entry).toBeGreaterThanOrEqual(56.72);
});

test("lookForEntry in CCI", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "CCI" },
        { symbol: "VZ" },
    ]);
    const result = await lookForEntry("CCI", mockBrokerage, 1603895590000);

    expect(result).toBeTruthy();
    expect(result!.symbol).toEqual("CCI");
    expect(result!.entry).not.toEqual(result!.limit_price);
    expect(result!.entry).toBeLessThanOrEqual(157.78);
    expect(result!.entry).toBeGreaterThanOrEqual(157.68);
    expect(result!.stop).toBeGreaterThanOrEqual(158.61);
    expect(result!.stop).toBeLessThanOrEqual(158.81);
}); */

test("rebalanceForSymbol in CCI", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);

    mockCreateOrder.mockReset();

    const epoch = 1603895590000;

    const calendar = await CachedCalendar.getCalendar(epoch);

    await rebalanceForSymbol("CCI", calendar, mockBrokerage, epoch);

    expect(mockCreateOrder).toHaveBeenCalledWith(
        {
            entry: 157.7356947082247,
            limit_price: 157.67851922193256,
            quantity: -10,
            side: "short",
            stop: 158.7356947082247,
            symbol: "CCI",
            target: 155.7356947082247,
        },
        mockBrokerage
    );
});
/* 
test("lookForEntry when in watchlist but not the right time", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    const result = await lookForEntry("VZ", mockBrokerage, 1603924390000);

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist but not the right time with a previously open order", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    mockGetOpenOrders.mockResolvedValueOnce([{ symbol: "VZ", id: 1 }]);

    const result = await lookForEntry("VZ", mockBrokerage, 1603903166000);

    expect(result).toBeFalsy();

    expect(mockCancel).toHaveBeenCalledWith(1);
});

test("lookForEntry when in watchlist but also has an open position", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    const result = await lookForEntry("VZ", mockBrokerage, 1603895590000);

    expect(result).toBeFalsy();
});

test("enterSymbol with position returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    const result = await enterSymbol("VZ", mockBrokerage, 1603895590000);

    expect(result).toBeFalsy();
});

test("enterSymbol with no position returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([]);
    mockWatchlist.mockReturnValueOnce([
        { symbol: "AAPL" },
        { symbol: "BDX" },
        { symbol: "VZ" },
    ]);
    mockCreateOrder.mockReturnValueOnce(true);
    const result = await enterSymbol("VZ", mockBrokerage, 1603895400000);

    expect(result).toBeTruthy();
}); */

test("getPersistedData for VZ", async () => {
    const calendar = await getCalendar(
        new Date(1603895400000),
        new Date(1603895400000)
    );
    const { data, lastBar } = await getPersistedData(
        "VZ",
        calendar,
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
