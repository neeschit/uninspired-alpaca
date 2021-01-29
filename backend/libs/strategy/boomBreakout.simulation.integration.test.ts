import { Calendar, TradeDirection } from "@neeschit/alpaca-trade-api";
import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { getBoomBarData } from "./boomBar.simulation";
import {
    BoomBarBreakoutSimulation,
    getEntryForBoomBreakout,
    getStopForBoomBreakout,
} from "./boomBreakout.simulation";

const getOpenPositionsMock = mockBrokerage.getOpenPositions as jest.Mock;

test("boom bar breakout for 01/22/2020 for INTC", async () => {
    const boomSim = new BoomBarBreakoutSimulation("INTC", mockBrokerage);

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

    const readyForEntryEpoch = 1611326160000; //1/22 9:36

    getOpenPositionsMock.mockReturnValue([]);

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValue([]);

    const mockCreateBracketOrder = mockBrokerage.createBracketOrder as jest.Mock;

    mockCreateBracketOrder.mockReturnValue({
        id: "test" + Date.now(),
    });

    await boomSim.rebalance(calendar, readyForEntryEpoch);

    expect(boomSim.isInPlay()).toBeFalsy();

    expect(boomSim.broker.createBracketOrder).not.toHaveBeenCalled();
});

test("get stop for boom trade NTES long 2nd bar", async () => {
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

    const entryEpoch = 1611326400000; // 1/22 9:40:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "NTES");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 1);

    expect(stop).toEqual(113.78);
});
test("get stop for boom trade NTES long 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:55:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "NTES");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 1);

    expect(stop).toEqual(114.08);
});

test("get stop for boom trade NIO short 4th bar", async () => {
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

    const entryEpoch = 1611327000000; // 1/22 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "NIO");

    const stop = getStopForBoomBreakout(TradeDirection.sell, data[0], data, 3);

    expect(stop).toBeGreaterThan(59.33);
    expect(stop).toBeLessThanOrEqual(59.34);
});

test("get stop for boom trade SQ short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "SQ");

    const stop = getStopForBoomBreakout(TradeDirection.sell, data[0], data, 4);

    expect(stop).toBeGreaterThan(222.33);
    expect(stop).toBeLessThanOrEqual(222.34);
});

test("get stop for boom trade AMAT short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "AMAT");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 4);

    expect(stop).toBeGreaterThanOrEqual(108.71);
    expect(stop).toBeLessThan(108.72);
});

test("get stop for boom trade DIS short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "DIS");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 4);

    expect(stop).toBeGreaterThanOrEqual(172.69);
    expect(stop).toBeLessThan(172.7);
});

test("get stop for boom trade BAC short 5th bar", async () => {
    const calendar: Calendar[] = [
        {
            date: "2021-01-18",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-19",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-20",
            open: "09:30",
            close: "16:00",
        },
    ];

    const entryEpoch = 1611068100000; // 1/19 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "BAC");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 4);

    expect(stop).toBeGreaterThanOrEqual(32.76);
    expect(stop).toBeLessThan(32.78);
});

test("get stop for boom trade INTC short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:50:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "INTC");

    const stop = getStopForBoomBreakout(TradeDirection.buy, data[0], data, 4);

    expect(stop).toBeGreaterThanOrEqual(58.53);
    expect(stop).toBeLessThan(58.55);
});

test("get entry for boom trade LRCX short 2nd bar", async () => {
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

    const entryEpoch = 1611326400000; // 1/22 9:40:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "LRCX");

    const entry = getEntryForBoomBreakout(TradeDirection.buy, data[0], data, 1);

    expect(entry).toBeGreaterThan(572.69);
    expect(entry).toBeLessThanOrEqual(572.71);
});

test("get entry for boom trade NTES short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:55:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "NTES");

    const entry = getEntryForBoomBreakout(TradeDirection.buy, data[0], data, 4);

    expect(entry).toBeGreaterThan(115.29);
    expect(entry).toBeLessThanOrEqual(115.31);
});

test("get entry for boom trade SQ short 5th bar", async () => {
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

    const entryEpoch = 1611327300000; // 1/22 9:55:00

    getOpenPositionsMock.mockReturnValueOnce([]);

    const data = await getBoomBarData(calendar, entryEpoch, "SQ");

    const entry = getEntryForBoomBreakout(
        TradeDirection.sell,
        data[0],
        data,
        4
    );

    expect(entry).toBeGreaterThan(221.48);
    expect(entry).toBeLessThanOrEqual(221.5);
});

test("boom bar breakout for 01/19/2020 for ROKU", async () => {
    const boomSim = new BoomBarBreakoutSimulation("ROKU", mockBrokerage);

    const calendar: Calendar[] = [
        {
            date: "2021-01-18",
            open: "09:30",
            close: "16:00",
        },
        {
            date: "2021-01-19",
            open: "09:30",
            close: "16:00",
        },
    ];

    const readyForEntryEpoch = 1611066900000; //1/19 9:35

    getOpenPositionsMock.mockReturnValueOnce([]);

    const mockGetOpenOrders = mockBrokerage.getOpenOrders as jest.Mock;

    mockGetOpenOrders.mockReturnValueOnce([]);

    const mockGetOpenPositions = mockBrokerage.getOpenPositions as jest.Mock;

    mockGetOpenPositions.mockReturnValueOnce([]);

    await boomSim.rebalance(calendar, readyForEntryEpoch);

    expect(boomSim.isInPlay()).toBeFalsy();

    mockGetOpenPositions.mockReturnValueOnce([]);

    const mockCreateBracketOrder = mockBrokerage.createBracketOrder as jest.Mock;

    mockCreateBracketOrder.mockReturnValue({
        id: "test" + Date.now(),
    });

    await boomSim.rebalance(calendar, 1611067500000); //1/19 9:45

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
            stop_price: expect.any(String),
            symbol: "ROKU",
            take_profit: {
                limit_price: expect.any(Number),
            },
            time_in_force: "day",
            type: "stop",
        })
    );
});
