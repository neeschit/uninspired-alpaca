import { getApiServer } from "../../src/util/api";

/**
 * WARNING: DO NOT REORGANIZE IMPORTS WILLY NILLY
 */

jest.mock("../../src/util/api");
jest.mock("./trade-manager.handlers");
jest.mock("../brokerage-helpers");

import { enterSymbol, rebalanceForSymbol } from "./trade-manager.handlers";

const mockGetApiServer = <jest.Mock>getApiServer;
const mockLookForEntry = <jest.Mock>enterSymbol;

mockGetApiServer.mockReturnValue({
    get: () => {},
    post: () => {},
});
import { queueEntryForSymbol } from "./trade-manager";
test("queueEntryForSymbol", async () => {
    mockLookForEntry.mockResolvedValueOnce(true);
    const result = await queueEntryForSymbol({
        params: {
            symbol: "AMZN",
        },
    });

    expect(result).toBeTruthy();
});

test("queueEntryForSymbol on exception", async () => {
    mockLookForEntry.mockRejectedValueOnce(new Error("test"));

    const result = await queueEntryForSymbol({
        params: {
            symbol: "AMZN",
        },
    });

    expect(result).toStrictEqual([]);
});

test("queueEntryForSymbol on exception", async () => {
    mockLookForEntry.mockRejectedValueOnce(new Error("test"));

    const result = await queueEntryForSymbol({
        params: {
            symbol: "AMZN",
            body: {
                epoch: Date.now(),
            },
        },
    });

    expect(result).toStrictEqual([]);
});
