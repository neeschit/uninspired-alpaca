import { Calendar } from "@neeschit/alpaca-trade-api";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { BoomBarSimulation } from "./boomBar.simulation";

const getOpenPositionsMock = mockBrokerage.getOpenPositions as jest.Mock;

test("boom bar for 01/05/2020", async () => {
    const boomSim = new BoomBarSimulation("JD", mockBrokerage);

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
    ];

    await boomSim.beforeMarketStarts(calendar, 1609856700000); // 01/05@9:25am

    const readyForEntryEpoch = 1609857300000;

    getOpenPositionsMock.mockReturnValueOnce([]);

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValueOnce([]);

    const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

    mockGetOpenPositions.mockReturnValueOnce([]);

    const mockCreateBracketOrder = mockBrokerage.createBracketOrder as jest.Mock;

    mockCreateBracketOrder.mockReturnValueOnce({
        id: "test" + Date.now(),
    });

    await boomSim.rebalance(calendar, readyForEntryEpoch);

    expect(boomSim.isInPlay()).toBeTruthy();

    expect(boomSim.broker.createBracketOrder).toHaveBeenCalledTimes(1);
    expect(boomSim.broker.createBracketOrder).toHaveBeenLastCalledWith(
        expect.objectContaining({
            client_order_id: expect.any(String),
            extended_hours: false,
            limit_price: null,
            order_class: "bracket",
            qty: 7,
            side: "buy",
            stop_loss: {
                stop_price: 89.30015,
            },
            stop_price: null,
            symbol: "JD",
            take_profit: {
                limit_price: 93.8397,
            },
            time_in_force: "day",
            type: "market",
        })
    );
});
