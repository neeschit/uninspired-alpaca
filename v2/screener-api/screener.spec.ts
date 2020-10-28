import { getApiServer } from "../../src/util/api";
jest.mock("../../src/util/api");
jest.mock("./screener.handlers");

import { getWatchlistForDate } from "./screener.handlers";

const mockGetApiServer = <jest.Mock>getApiServer;
const mockGetWatchlistForDate = <jest.Mock>getWatchlistForDate;

mockGetApiServer.mockReturnValue({
    get: () => {},
});

import { watchlistGetter } from "./screener";

test("watchlistGetter", async () => {
    mockGetWatchlistForDate.mockResolvedValueOnce(["test"]);
    const result = await watchlistGetter({
        params: {
            date: "10-23-2020",
        },
    });

    expect(result).toStrictEqual(["test"]);
});

test("watchlistGetter on exception", async () => {
    mockGetWatchlistForDate.mockRejectedValueOnce(new Error("test"));

    const result = await watchlistGetter({
        params: {
            date: "10-23-2020",
        },
    });

    expect(result).toStrictEqual([]);
});
