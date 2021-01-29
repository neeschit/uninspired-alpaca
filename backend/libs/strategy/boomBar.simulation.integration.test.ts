import { Calendar } from "@neeschit/alpaca-trade-api";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { MockBrokerage } from "../simulation-helpers/mockBrokerage";
import { BoomBarSimulation, getBoomBarData } from "./boomBar.simulation";

const getOpenPositionsMock = mockBrokerage.getOpenPositions as jest.Mock;

jest.setTimeout(10000);

test("boom bar for 01/05/2021", async () => {
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
            qty: expect.any(Number),
            side: "buy",
            stop_loss: {
                stop_price: expect.any(Number),
            },
            stop_price: null,
            symbol: "JD",
            take_profit: {
                limit_price: expect.any(Number),
            },
            time_in_force: "day",
            type: "market",
        })
    );
});
test("boom bar for 01/06/2020", async () => {
    const boomSim = new BoomBarSimulation("LLY", mockBrokerage);

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
    ];

    const premarketEpoch = 1609943100000;

    await boomSim.beforeMarketStarts(calendar, premarketEpoch);

    const readyForEntryEpoch = 1609943700000;

    const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

    mockGetOpenPositions.mockReturnValueOnce([]);

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValueOnce([]);

    await boomSim.rebalance(calendar, readyForEntryEpoch);

    expect(boomSim.isInPlay()).toBeFalsy();

    expect(boomSim.broker.createBracketOrder).not.toHaveBeenCalled();
});

test("boom bar for ROKU on 01/04", async () => {
    const boomSim = new BoomBarSimulation("CHTR", mockBrokerage);

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
    ];

    await boomSim.beforeMarketStarts(calendar, 1609943100000); // 01/05@9:25am

    const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

    mockGetOpenPositions.mockReturnValueOnce([]);

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValueOnce([]);

    await boomSim.rebalance(calendar, 1609943700000);

    expect(boomSim.isInPlay()).toBeTruthy();

    expect(mockBrokerage.createBracketOrder).not.toHaveBeenCalled();
});

test("getBoomBarData should only return bars according to minutes passed", async () => {
    const calendar: Calendar[] = [
        {
            date: "2021-01-21",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    const entryEpoch = 1611326160000; // 1/22 9:36:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "INTC");

    expect(data.length).toEqual(1);
});
