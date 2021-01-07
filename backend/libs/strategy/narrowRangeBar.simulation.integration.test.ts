import { NarrowRangeBarSimulation } from "./narrowRangeBar.simulation";
import { batchInsertDailyBars } from "../core-utils/resources/stockData";
import { getBracketOrderForPlan } from "../trade-management-helpers/order";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { PositionDirection } from "@neeschit/alpaca-trade-api";

jest.mock("../core-utils/resources/stockData", () => {
    const module = jest.requireActual("../core-utils/resources/stockData");
    return {
        ...module,
        batchInsertDailyBars: jest.fn(),
    };
});
jest.mock("../../services/trade-management-api/trade-manager.handlers");

const mockBackInsertDailyBars = batchInsertDailyBars as jest.Mock;
const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;
const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

test("narrow range bar strategy simulation - if insertion fails", async () => {
    const nrb = new NarrowRangeBarSimulation("AAPL", mockBrokerage);

    mockBackInsertDailyBars.mockReset();

    mockBackInsertDailyBars.mockRejectedValueOnce(
        new Error("test_error_inserting")
    );

    await nrb.beforeMarketStarts([]);
});

test("narrow range bar strategy simulation - after entry time has passed with open position", async () => {
    const nrb = new NarrowRangeBarSimulation("AAPL", mockBrokerage);

    mockGetOpenPositions.mockReset();
    mockGetOpenPositions.mockReturnValueOnce([{ symbol: "AAPL" }]);

    await nrb.afterEntryTimePassed();

    expect(mockBrokerage.cancelAlpacaOrder).not.toHaveBeenCalled();
});

test("narrow range bar strategy simulation - after entry time has passed", async () => {
    const nrb = new NarrowRangeBarSimulation("AAPL", mockBrokerage);

    mockGetOpenPositions.mockReset();
    mockGetOpenPositions.mockReturnValueOnce([{ symbol: "VZ" }]);

    mockGetOpenOrders.mockResolvedValueOnce([
        {
            symbol: "AAPL",
        },
    ]);

    await nrb.afterEntryTimePassed();

    expect(mockBrokerage.cancelAlpacaOrder).toHaveBeenCalled();
});

test("nrb simulation - rebalance", async () => {
    const nrb = new NarrowRangeBarSimulation("QCOM", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();

    mockGetOpenPositions.mockReturnValue([]);
    mockGetOpenOrders.mockResolvedValueOnce([]);
    const mockCreateOrder = mockBrokerage.createBracketOrder as jest.Mock;

    mockCreateOrder.mockReturnValueOnce({
        id: "test_" + Date.now(),
    });

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );

    await nrb.rebalance(calendar, 1608649200000);

    const plan = {
        entry: 145.913521981893,
        limit_price: 145.913521981893,
        quantity: -16,
        side: PositionDirection.short,
        stop: 146.57553087901235,
        symbol: "QCOM",
        target: 144.74227547160498,
    };

    const unfilledOrder = getBracketOrderForPlan(plan);

    expect(mockBrokerage.createBracketOrder).toHaveBeenCalledWith(
        expect.objectContaining({
            client_order_id: expect.any(String),
            extended_hours: false,
            limit_price: "145.913521981893",
            order_class: "bracket",
            qty: 16,
            side: "sell",
            stop_loss: {
                stop_price: plan.stop,
            },
            stop_price: null,
            symbol: "QCOM",
            take_profit: {
                limit_price: plan.target,
            },
            time_in_force: "day",
            type: "limit",
        })
    );
});

test("nrb simulation - rebalance when in open position", async () => {
    const nrb = new NarrowRangeBarSimulation("QCOM", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();

    mockGetOpenPositions.mockReturnValue([{ symbol: "QCOM" }]);

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );
    await nrb.rebalance(calendar, 1608649200000);
    expect(mockBrokerage.createSimpleOrder).not.toHaveBeenCalled();
});

test("nrb simulation - rebalance when not an nrb", async () => {
    const nrb = new NarrowRangeBarSimulation("AAPL", mockBrokerage);

    mockBackInsertDailyBars.mockResolvedValueOnce([]);

    mockGetOpenPositions.mockReset();

    mockGetOpenPositions.mockReturnValue([{ symbol: "QCOM" }]);

    const calendar = await getCalendar(
        new Date(1608649200000),
        new Date(1608649200000)
    );
    await nrb.rebalance(calendar, 1608649200000);

    expect(mockBrokerage.createSimpleOrder).not.toHaveBeenCalled();
});
