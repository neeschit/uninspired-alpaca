import { lookForEntry } from "./trade-manager.handlers";
import { getWatchlistFromScreenerService } from "../screener-api/screener.interfaces";

jest.mock("../screener-api/screener.interfaces");

const mockWatchlist = <jest.Mock>getWatchlistFromScreenerService;

test("lookForEntry", async () => {
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX"]);
    const result = await lookForEntry("VZ");

    expect(result).toBeFalsy();
});

test("lookForEntry when in watchlist & timing for entry is correct", async () => {
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await lookForEntry("VZ", 1603895590000);

    expect(result).toBeTruthy();
});

test("lookForEntry when in watchlist but not the right time", async () => {
    mockWatchlist.mockReturnValueOnce(["AAPL", "BDX", "VZ"]);
    const result = await lookForEntry("VZ", 1603924390000);

    expect(result).toBeFalsy();
});
