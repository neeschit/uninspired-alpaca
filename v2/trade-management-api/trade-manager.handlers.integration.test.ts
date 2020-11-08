import { enterSymbol, lookForEntry } from "./trade-manager.handlers";
import { getWatchlistFromScreenerService } from "../screener-api/screener.interfaces";
import { getOpenPositions } from "../brokerage-helpers";
import { createOrderSynchronized } from "../trade-management-helpers";
import { endPooledConnection } from "../../src/connection/pg";

jest.mock("../screener-api/screener.interfaces");

jest.mock("../brokerage-helpers");
jest.mock("../trade-management-helpers");

const mockGetOpenPositions = <jest.Mock>getOpenPositions;
const mockCreateOrder = <jest.Mock>createOrderSynchronized;

const mockWatchlist = <jest.Mock>getWatchlistFromScreenerService;

test("lookForEntry", async () => {
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX"]);
    const result = await lookForEntry("VZ");

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist & timing for entry is correct", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await lookForEntry("VZ", 1603895590000);

    expect(result).toBeTruthy();
    expect(result!.symbol).toEqual("VZ");
    expect(result!.entry).not.toEqual(result!.limit_price);
    expect(result!.entry).toBeGreaterThanOrEqual(56.72);
});

test("lookForEntry in CCI", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "CCI", "VZ"]);
    const result = await lookForEntry("CCI", 1603895590000);

    expect(result).toBeTruthy();
    expect(result!.symbol).toEqual("CCI");
    expect(result!.entry).not.toEqual(result!.limit_price);
    expect(result!.entry).toBeLessThanOrEqual(157.78);
    expect(result!.entry).toBeGreaterThanOrEqual(157.68);
    expect(result!.stop).toBeGreaterThanOrEqual(158.79);
    expect(result!.stop).toBeLessThanOrEqual(158.81);
});

test("lookForEntry when in watchlist but not the right time", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "BDX" }]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await lookForEntry("VZ", 1603924390000);

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist but also has an open position", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await lookForEntry("VZ", 1603895590000);

    expect(result).toBeFalsy();
});

test("enterSymbol with no plan returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([{ symbol: "VZ" }]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await enterSymbol("VZ", 1603895590000);

    expect(result).toBeFalsy();
});

test("enterSymbol with plan returned", async () => {
    mockGetOpenPositions.mockResolvedValueOnce([]);
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    mockCreateOrder.mockReturnValueOnce(true);
    const result = await enterSymbol("VZ", 1603895590000);

    expect(result).toBeTruthy();
});

afterAll(async () => {
    await endPooledConnection();
});
