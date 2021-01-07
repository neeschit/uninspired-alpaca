import {
    Calendar,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
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
