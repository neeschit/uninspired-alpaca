import { getApiServer } from "../../src/util/api";

/**
 * WARNING: DO NOT REORGANIZE IMPORTS WILLY NILLY
 */

jest.mock("../../src/util/api");
jest.mock("./trade-manager.handlers");
jest.mock("../brokerage-helpers/alpaca");

import { rebalanceForSymbol } from "./trade-manager.handlers";

const mockGetApiServer = <jest.Mock>getApiServer;
const mockRebalance = <jest.Mock>rebalanceForSymbol;

mockGetApiServer.mockReturnValue({
    get: () => {},
    post: () => {},
});
import { rebalance } from "./trade-manager";

test("queueEntryForSymbol", async () => {
    mockRebalance.mockResolvedValueOnce(true);
    const result = await rebalance({
        params: {
            symbol: "AMZN",
        },
    });

    expect(result).toBeTruthy();
});

test("queueEntryForSymbol on exception", async () => {
    mockRebalance.mockRejectedValueOnce(new Error("test"));

    const result = await rebalance({
        params: {
            symbol: "AMZN",
        },
    });

    expect(result).toEqual(false);
});

test("queueEntryForSymbol on exception", async () => {
    mockRebalance.mockRejectedValueOnce(new Error("test"));

    const result = await rebalance({
        params: {
            symbol: "AMZN",
        },
        body: {
            epoch: Date.now(),
            calendar: [],
        },
    });

    expect(result).toEqual(false);
});
