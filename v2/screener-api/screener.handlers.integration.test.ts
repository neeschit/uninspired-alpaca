import { endPooledConnection } from "../../src/connection/pg";
import { currentTradingSymbols } from "../../src/data/filters";
import { getWatchlistForDate } from "./screener.handlers";

test("getWatchListForDate", async () => {
    jest.setTimeout(10000);
    const date = "10-23-2020";

    const watchList = await getWatchlistForDate(currentTradingSymbols, date);

    expect(watchList).toBeTruthy();
    expect(watchList).toStrictEqual([
        { symbol: "AMZN", atr: 104.6453783727994 },
        { symbol: "JNJ", atr: 2.343836803469414 },
        { symbol: "NFLX", atr: 20.50041363999451 },
        { symbol: "PFE", atr: 0.7495092625174182 },
        { symbol: "VRTX", atr: 10.892275997243448 },
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
