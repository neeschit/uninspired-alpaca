import { TradeDirection } from "@neeschit/alpaca-trade-api";
import { disconnectAlpacaStreams, setupAlpacaStreams } from "./alpaca";
import {
    getRiskAdjustedQuantity,
    handleEntryRequest,
} from "./handleEntryRequest";

const redisGet = jest.fn();
const redisSet = jest.fn();

beforeAll(() => {
    setupAlpacaStreams(redisSet);
});

afterAll(() => {
    disconnectAlpacaStreams();
});

beforeEach(() => {
    redisGet.mockReset();
    redisSet.mockReset();
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
        redisGet,
        redisSet,
    });

    setTimeout(async () => {
        await handleEntryRequest({
            symbol: "AAPL",
            epoch: Date.now(),
            client: client as any,
            redisGet,
            redisSet,
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
    expect(qty).toBeLessThan(100);
});
