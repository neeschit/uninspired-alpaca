import { endPooledConnection } from "../../src/connection/pg";
import { currentTradingSymbols } from "../../src/data/filters";
import { getWatchlistForDate } from "./screener.handlers";

test("getWatchListForDate", async () => {
    const date = "10-23-2020";

    const watchList = await getWatchlistForDate(date, currentTradingSymbols);

    expect(watchList).toBeTruthy();
    expect(watchList).toStrictEqual(["AMZN", "JNJ", "NFLX", "PFE", "VRTX"]);
});

afterAll(async () => {
    await endPooledConnection();
});
