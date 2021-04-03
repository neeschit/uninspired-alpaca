import { endPooledConnection } from "../../libs/core-utils/connection/pg";
import { currentTradingSymbols } from "../libs/core-utils/data/filters";
import { getWatchlistForDate } from "./screener.handlers";

test("getWatchListForDate", async () => {
    jest.setTimeout(10000);
    const date = "2020-10-23";

    const watchList = await getWatchlistForDate(currentTradingSymbols, date);

    expect(watchList).toBeTruthy();
    expect(watchList).toStrictEqual([
        { symbol: "AMZN", atr: expect.any(Number) },
        { symbol: "ICE", atr: expect.any(Number) },
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
