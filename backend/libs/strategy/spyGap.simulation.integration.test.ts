import {
    Calendar,
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import { SpyGapCloseSimulation } from "./spyGap.simulation";

jest.mock("../core-utils/resources/stockData", () => {
    const module = jest.requireActual("../core-utils/resources/stockData");
    return {
        ...module,
        batchInsertDailyBars: jest.fn(),
    };
});

jest.setTimeout(10000);

test("spy gap simulation on 12/29", async () => {
    const spyGapSimulation = new SpyGapCloseSimulation("SPY", mockBrokerage);

    const calendar: Calendar[] = [
        {
            date: "2020-12-29",
            open: "09:30",
            close: "16:00",
        },
    ];

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValueOnce([]);

    const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

    mockGetOpenPositions.mockReturnValueOnce([]);

    const mockCreateSimpleOrder = mockBrokerage.createSimpleOrder as jest.Mock;

    mockCreateSimpleOrder.mockReturnValueOnce({
        id: "test" + Date.now(),
    });

    await spyGapSimulation.beforeMarketStarts(calendar, 1609250400000);

    expect(spyGapSimulation.isInPlay()).toEqual(true);

    expect(mockCreateSimpleOrder).toHaveBeenCalledWith(
        expect.objectContaining({
            client_order_id: expect.any(String),
            symbol: "SPY",
            qty: expect.any(Number),
            side: TradeDirection.sell,
            type: TradeType.market,
            time_in_force: TimeInForce.opg,
            order_class: "simple",
            extended_hours: false,
            take_profit: undefined,
            stop_loss: undefined,
            stop_price: null,
            limit_price: null,
        })
    );
});

test("log telemetry for spy gap on 1/08/21", async () => {
    const spyGapSimulation = new SpyGapCloseSimulation("SPY", mockBrokerage);

    const mockPosition: ClosedMockPosition = {
        symbol: "SPY",
        averageEntryPrice: 380.59,
        averageExitPrice: 379.1,
        plannedEntryPrice: 380.59,
        plannedTargetPrice: 379.1,
        qty: 100,
        side: PositionDirection.short,
        entryTime: "2021-01-08T14:30:00.000Z",
        exitTime: "2021-01-08T15:28:00.000Z",
        orderIds: {
            open: "628d0523-e82e-46e9-b228-1be49c2dee32",
            close: "ea50b087-a3f5-44ee-a940-ee5959cbb960",
        },
        totalPnl: 148.99999999999523,
    };

    const calendar: Calendar[] = [
        {
            date: "2021-01-04",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-05",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-06",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-07",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-08",
            open: "09:30",
            close: "16:00",
        },
    ];

    const telemetry = await spyGapSimulation.logTelemetryForProfitHacking(
        mockPosition,
        calendar,
        1610139600000 // close of day 1/08
    );

    expect(telemetry).toStrictEqual({
        gap: 0.3914974119130698,
        marketGap: 0.3914974119130698,
        maxPnl: 2.342281879194674,
    });
});
