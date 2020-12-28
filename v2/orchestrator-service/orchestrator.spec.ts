import { readJsonSync } from "fs-extra";
import { rebalance } from "../trade-management-api/trade-manager.interfaces";
import { Bar } from "../../libs/core-utils/data/data.model";
import { onStockMinuteDataPosted } from "./orchestrator";

jest.mock("../trade-management-api/trade-manager.interfaces");

const mockEnterTrade = rebalance as jest.Mock;

jest.mock("pg", () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };

    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return { Client: jest.fn(() => mClient), Pool: jest.fn(() => mPool) };
});

test("onStockMinuteDataPosted - with data posted", async () => {
    const minuteData: Bar[] = readJsonSync(
        "./fixtures/jnj-replay-10-28-2020.json"
    );

    const bars = [minuteData[0], minuteData[0]];

    mockEnterTrade.mockResolvedValueOnce({
        id: 1,
    });
    const result = await onStockMinuteDataPosted("test", JSON.stringify(bars));

    expect(mockEnterTrade.mock.calls.length).toEqual(1);
});

test("onStockMinuteDataPosted - with data posted", async () => {
    const minuteData: Bar[] = readJsonSync(
        "./fixtures/jnj-replay-10-28-2020.json"
    );

    const bars = [minuteData[0], minuteData[0]];

    mockEnterTrade.mockRejectedValueOnce(new Error("test"));
    const result = await onStockMinuteDataPosted("test", JSON.stringify(bars));

    expect(mockEnterTrade.mock.calls.length).toEqual(1);
});

test("onStockMinuteDataPosted - no data posted", async () => {
    const result = await onStockMinuteDataPosted("test", JSON.stringify([]));

    expect(mockEnterTrade.mock.calls.length).toEqual(0);
});

test("onStockMinuteDataPosted - no data posted", async () => {
    const result = await onStockMinuteDataPosted(
        "test",
        JSON.stringify([
            {
                test: "fail",
            },
        ])
    );

    expect(mockEnterTrade.mock.calls.length).toEqual(0);
});

afterAll(() => {
    jest.restoreAllMocks();
});
