import {
    cancelOpenOrdersAfterEntryTimePassed,
    rebalanceSymbol,
    getPersistedData,
    rebalanceForSymbol,
} from "./trade-manager.handlers";
import { getWatchlistFromScreenerService } from "../screener-api";
import {
    cancelAlpacaOrder,
    getOpenOrders,
    getOpenPositions,
    liquidatePosition,
} from "../brokerage-helpers";
import { createOrderSynchronized } from "../trade-management-helpers";
import { endPooledConnection } from "../../src/connection/pg";

jest.mock("../screener-api");

jest.mock("../brokerage-helpers", () => {
    const { getCalendar } = jest.requireActual("../brokerage-helpers");

    return {
        getCalendar,
        cancelAlpacaOrder: jest.fn(),
        getOpenOrders: jest.fn(),
        getOpenPositions: jest.fn(),
        liquidatePosition: jest.fn(),
    };
});
jest.mock("../trade-management-helpers");

const mockGetOpenOrders = getOpenOrders as jest.Mock;
const mockLiquidatePosition = liquidatePosition as jest.Mock;
const mockGetOpenPositions = <jest.Mock>getOpenPositions;
const mockCreateOrder = <jest.Mock>createOrderSynchronized;

const mockWatchlist = <jest.Mock>getWatchlistFromScreenerService;
const mockCancel = cancelAlpacaOrder as jest.Mock;

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

test("lookForEntry", async () => {
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }]);
    const result = await rebalanceForSymbol("VZ");

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist & timing for entry is correct", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    const result = await rebalanceForSymbol("VZ", 1603895590000);

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
    const result = await rebalanceForSymbol("CCI", 1603895590000);

    expect(result).toBeTruthy();
    expect(result!.symbol).toEqual("CCI");
    expect(result!.entry).not.toEqual(result!.limit_price);
    expect(result!.entry).toBeLessThanOrEqual(157.78);
    expect(result!.entry).toBeGreaterThanOrEqual(157.68);
    expect(result!.stop).toBeGreaterThanOrEqual(158.61);
    expect(result!.stop).toBeLessThanOrEqual(158.81);
});

test("lookForEntry when in watchlist but not the right time", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    const result = await rebalanceForSymbol("VZ", 1603924390000);

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist but not the right time with a previously open order", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    mockGetOpenOrders.mockResolvedValueOnce([{ symbol: "VZ", id: 1 }]);

    const result = await rebalanceForSymbol("VZ", 1603903166000);

    expect(result).toBeFalsy();

    expect(mockCancel).toHaveBeenCalledWith(1);
});

test("lookForEntry when in watchlist but also has an open position", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    const result = await rebalanceForSymbol("VZ", 1603895590000);

    expect(result).toBeFalsy();
});

test("enterSymbol with position returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    const result = await rebalanceSymbol("VZ", 1603895590000);

    expect(result).toBeFalsy();
});

test("liquidatePositions when market is closing", async () => {
    const dec14Three45PM = 1603914300000;
    mockLiquidatePosition.mockReset();
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    const result = await rebalanceSymbol("VZ", dec14Three45PM);
    expect(mockLiquidatePosition).toHaveBeenCalledWith("VZ");
    expect(result).toBeFalsy();
});

test("enterSymbol with no position returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([]);
    mockWatchlist.mockReturnValueOnce([{ symbol: "AAPL" }, { symbol: "BDX" }, { symbol: "VZ" }]);
    mockCreateOrder.mockReturnValueOnce(true);
    const result = await rebalanceSymbol("VZ", 1603895400000);

    expect(result).toBeTruthy();
});

test("getPersistedData for VZ", async () => {
    const { data, lastBar } = await getPersistedData("VZ", 1603895400000);

    expect(data.length).toEqual(12);
    expect(Math.round(lastBar.c * 100)).toEqual(5685);
});

test("cancelOpenOrdersAfterEntryTimePassed - order to cancel", async () => {
    const symbol = "TEST";

    mockGetOpenOrders.mockResolvedValueOnce([{ symbol, id: 2 }]);

    await cancelOpenOrdersAfterEntryTimePassed(symbol);

    expect(mockCancel).toHaveBeenCalledWith(2);
});

test("cancelOpenOrdersAfterEntryTimePassed - no cancel", async () => {
    const symbol = "TEST";

    mockGetOpenOrders.mockResolvedValueOnce([]);

    await cancelOpenOrdersAfterEntryTimePassed(symbol);

    expect(mockCancel).not.toHaveBeenCalled();
});
