import { TradeDirection } from "@neeschit/alpaca-trade-api";
import { setupAlpaca } from "./alpaca";
import {
    getRiskAdjustedQuantity,
    handleEntryRequest,
} from "./handleEntryRequest";

beforeAll(() => {
    setupAlpaca();
});

jest.mock("./redis", () => {
    return {
        getRedisApi: () => ({
            promiseSet: jest.fn(),
            promiseGet: jest.fn(),
        }),
    };
});

test("no duplicate orders if orders are pretty much concurrent", async () => {
    const client = {
        createOrder: jest.fn(),
    };

    client.createOrder.mockResolvedValue(true);

    await handleEntryRequest({
        symbol: "AAPL",
        epoch: Date.now(),
        side: TradeDirection.buy,
        limitPrice: 100,
        client: client as any,
    });

    setTimeout(async () => {
        await handleEntryRequest({
            symbol: "AAPL",
            epoch: Date.now(),
            client: client as any,
            side: TradeDirection.buy,
            limitPrice: 100,
        });
    });

    expect(client.createOrder.mock.calls.length).toEqual(1);
});

test("risk manager simple case", async () => {
    const qty = await getRiskAdjustedQuantity({
        symbol: "AAPL",
    });

    expect(qty).toBeGreaterThan(150);
    expect(qty).toBeLessThan(200);
});

test("risk manager simple case", async () => {
    const qty = await getRiskAdjustedQuantity({
        symbol: "TSLA",
    });

    expect(qty).toBeGreaterThan(20);
    expect(qty).toBeLessThanOrEqual(100);
});
