import { endPooledConnection } from "../../src/connection/pg";
import { currentTradingSymbols } from "../../src/data/filters";
import { getWatchlistForDate } from "./screener.handlers";

test("getWatchListForDate", async () => {
    jest.setTimeout(10000);
    const date = "10-23-2020";

    const watchList = await getWatchlistForDate(currentTradingSymbols, date);

    expect(watchList).toBeTruthy();
    expect(watchList).toStrictEqual([
        { symbol: "AMZN", atr: expect.any(Number) },
        { symbol: "JNJ", atr: expect.any(Number) },
        { symbol: "LLY", atr: expect.any(Number) },
        { symbol: "NFLX", atr: expect.any(Number) },
        { symbol: "PFE", atr: expect.any(Number) },
        { symbol: "VRTX", atr: expect.any(Number) },
    ]);

    const watchListCached = await getWatchlistForDate(
        currentTradingSymbols,
        date
    );

    expect(watchList).toBeTruthy();
    expect(watchList).toEqual(watchListCached);
});

afterAll(async () => {
    await endPooledConnection();
});
