import { getApiServer } from "../../src/util/api";
jest.mock("../../src/util/api");
jest.mock("./trade-manager.handlers");

import { lookForEntry } from "./trade-manager.handlers";

const mockGetApiServer = <jest.Mock>getApiServer;
const mockLookForEntry = <jest.Mock>lookForEntry;

mockGetApiServer.mockReturnValue({
    get: () => {},
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
