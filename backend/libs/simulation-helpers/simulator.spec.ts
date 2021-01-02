import { Calendar, PositionDirection } from "@neeschit/alpaca-trade-api";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { SimulationStrategy } from "./simulation.strategy";
import {
    BacktestBatchResult,
    mergeResults,
    runStrategy,
    Simulator,
} from "./simulator";

test("Backtester - simulate batching with batches being limited to single days", () => {
    const zonedStartDate = "2021-01-04T16:00:00.000Z";
    const zonedEndDate = "2021-01-07T23:00:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(
        zonedStartDate,
        zonedEndDate,
        test,
        1001
    );

    expect(result.length).toEqual(4);

    expect(result[0]).toStrictEqual({
        endDate: "2021-01-05T16:00:00.000Z",
        startDate: "2021-01-04T16:00:00.000Z",
        symbols: test,
        batchId: 0,
    });
    expect(result[1]).toStrictEqual({
        endDate: "2021-01-06T16:00:00.000Z",
        startDate: "2021-01-05T16:00:00.000Z",
        symbols: test,
        batchId: 1,
    });
    expect(result[2]).toStrictEqual({
        endDate: "2021-01-07T16:00:00.000Z",
        startDate: "2021-01-06T16:00:00.000Z",
        symbols: test,
        batchId: 2,
    });
    expect(result[3]).toStrictEqual({
        endDate: "2021-01-07T23:00:00.000Z",
        startDate: "2021-01-07T16:00:00.000Z",
        symbols: test,
        batchId: 3,
    });
});

test("Backtest - simulate batching with symbols needing batching as well", async () => {
    const zonedStartDate = "2021-01-04T16:00:00.000Z";
    const zonedEndDate = "2021-01-07T23:00:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test, 1);

    expect(result.length).toEqual(12);

    expect(result[0]).toStrictEqual({
        endDate: "2021-01-05T16:00:00.000Z",
        startDate: "2021-01-04T16:00:00.000Z",
        symbols: ["ECL"],
        batchId: 0,
    });
    expect(result[1]).toStrictEqual({
        endDate: "2021-01-05T16:00:00.000Z",
        startDate: "2021-01-04T16:00:00.000Z",
        symbols: ["AAPL"],
        batchId: 1,
    });
    expect(result[2]).toStrictEqual({
        endDate: "2021-01-05T16:00:00.000Z",
        startDate: "2021-01-04T16:00:00.000Z",
        symbols: ["HON"],
        batchId: 2,
    });

    expect(result[9]).toStrictEqual({
        endDate: "2021-01-07T23:00:00.000Z",
        startDate: "2021-01-07T16:00:00.000Z",
        symbols: ["ECL"],
        batchId: 9,
    });
    expect(result[10]).toStrictEqual({
        endDate: "2021-01-07T23:00:00.000Z",
        startDate: "2021-01-07T16:00:00.000Z",
        symbols: ["AAPL"],
        batchId: 10,
    });
    expect(result[11]).toStrictEqual({
        endDate: "2021-01-07T23:00:00.000Z",
        startDate: "2021-01-07T16:00:00.000Z",
        symbols: ["HON"],
        batchId: 11,
    });
});

const mockAfterEntryPassed = jest.fn();
const mockBeforeMarketStarts = jest.fn();
const mockRebalance = jest.fn();
const mockWhenMarketClosing = jest.fn();
const mockOnMarketClose = jest.fn();
const mockHasEntryTimePassed = jest.fn();

class MockStrategy implements SimulationStrategy {
    beforeMarketStarts = mockBeforeMarketStarts;
    rebalance = mockRebalance;
    beforeMarketCloses = mockWhenMarketClosing;
    onMarketClose = mockOnMarketClose;
    afterEntryTimePassed = mockAfterEntryPassed;
    hasEntryTimePassed = mockHasEntryTimePassed;
    isInPlay = jest.fn();
}

test("Simulator should fake system time when executing batches", async () => {
    const zonedStartDate = "2020-01-02T00:00:00.000Z";
    const zonedEndDate = "2020-01-03T22:10:00.000Z";

    const test = ["AAPL", "BA"];

    const batches = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    const simulator = new Simulator();

    await simulator.run(batches, MockStrategy);

    expect(mockRebalance).toBeCalledTimes(750 * test.length);
    expect(mockBeforeMarketStarts).toBeCalledTimes(2 * test.length);
    expect(mockOnMarketClose).toBeCalledTimes(2 * test.length);
    expect(mockHasEntryTimePassed).toBeCalledTimes(750 * test.length);
    expect(mockWhenMarketClosing).toBeCalledTimes(30 * test.length);
});

test("get market open time for day", async () => {
    const calendar = await getCalendar(
        new Date("12-11-2020"),
        new Date("12-12-2020")
    );
    const openTime = Simulator.getMarketOpenTimeForDay(1607663300000, calendar);

    expect(openTime).toEqual(1607697000000);
});

test("get market open time for a weekend", async () => {
    const calendar = await getCalendar(
        new Date("12-05-2020"),
        new Date("12-07-2020")
    );
    const openTime = Simulator.getMarketOpenTimeForDay(1607178600000, calendar);

    expect(openTime).toEqual(1607351400000);
});

test("get market open time without calendar", async () => {
    expect(
        Simulator.getMarketOpenTimeForDay.bind({}, 1607178600000, [])
    ).toThrow(`no_calendar_found_2020-12-05`);
});

test("runStrategy - afterEntryPassed", async () => {
    const mockStrategy = new MockStrategy();
    const calendar: Calendar[] = [
        {
            date: "2020-12-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    mockHasEntryTimePassed.mockReturnValueOnce(true);

    await runStrategy(
        "TEST",
        calendar,
        (mockStrategy as unknown) as SimulationStrategy,
        1608657977000
    );

    expect(mockAfterEntryPassed).toHaveBeenCalledTimes(1);
    expect(mockRebalance).not.toHaveBeenCalled();
    expect(mockBeforeMarketStarts).not.toHaveBeenCalled();
    expect(mockWhenMarketClosing).not.toHaveBeenCalled();
    expect(mockOnMarketClose).not.toHaveBeenCalled();
});

test("runStrategy - beforeMarketStarts", async () => {
    const mockStrategy = new MockStrategy();
    const calendar: Calendar[] = [
        {
            date: "2020-12-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    mockHasEntryTimePassed.mockReturnValueOnce(false);

    await runStrategy(
        "TEST",
        calendar,
        (mockStrategy as unknown) as SimulationStrategy,
        1608613881000
    );

    expect(mockBeforeMarketStarts).toHaveBeenCalledTimes(1);
    expect(mockAfterEntryPassed).not.toHaveBeenCalled();
    expect(mockRebalance).not.toHaveBeenCalled();
    expect(mockWhenMarketClosing).not.toHaveBeenCalled();
    expect(mockOnMarketClose).not.toHaveBeenCalled();
});

test("runStrategy - rebalance", async () => {
    const mockStrategy = new MockStrategy();
    const calendar: Calendar[] = [
        {
            date: "2020-12-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    mockHasEntryTimePassed.mockReturnValueOnce(false);

    await runStrategy(
        "TEST",
        calendar,
        (mockStrategy as unknown) as SimulationStrategy,
        1608657977000
    );

    expect(mockRebalance).toHaveBeenCalledTimes(1);
    expect(mockAfterEntryPassed).not.toHaveBeenCalled();
    expect(mockBeforeMarketStarts).not.toHaveBeenCalled();
    expect(mockWhenMarketClosing).not.toHaveBeenCalled();
    expect(mockOnMarketClose).not.toHaveBeenCalled();
});

test("runStrategy - whenMarketClosing", async () => {
    const mockStrategy = new MockStrategy();
    const calendar: Calendar[] = [
        {
            date: "2020-12-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    mockHasEntryTimePassed.mockReturnValueOnce(false);

    await runStrategy(
        "TEST",
        calendar,
        (mockStrategy as unknown) as SimulationStrategy,
        1608670500000
    );

    expect(mockWhenMarketClosing).toHaveBeenCalledTimes(1);
    expect(mockAfterEntryPassed).not.toHaveBeenCalled();
    expect(mockRebalance).not.toHaveBeenCalled();
    expect(mockOnMarketClose).not.toHaveBeenCalled();
    expect(mockBeforeMarketStarts).not.toHaveBeenCalled();
});

test("runStrategy - afterMarketCloses", async () => {
    const mockStrategy = new MockStrategy();
    const calendar: Calendar[] = [
        {
            date: "2020-12-22",
            open: "09:30",
            close: "16:00",
        },
    ];

    mockHasEntryTimePassed.mockReturnValueOnce(false);

    await runStrategy(
        "TEST",
        calendar,
        (mockStrategy as unknown) as SimulationStrategy,
        1608675081000
    );

    expect(mockOnMarketClose).toHaveBeenCalledTimes(1);
    expect(mockAfterEntryPassed).not.toHaveBeenCalled();
    expect(mockRebalance).not.toHaveBeenCalled();
    expect(mockWhenMarketClosing).not.toHaveBeenCalled();
    expect(mockBeforeMarketStarts).not.toHaveBeenCalled();
});

test("mergeResults", () => {
    const results: BacktestBatchResult[] = [
        {
            startDate: "2020-12-23",
            endDate: "2020-12-23",
            watchlist: {
                "2020-12-23": [
                    "BMY",
                    "CHL",
                    "DIS",
                    "DUK",
                    "INTC",
                    "LLY",
                    "MA",
                    "MCD",
                    "NKE",
                    "PLD",
                    "SCHW",
                    "SO",
                    "TXN",
                    "UNP",
                    "VMW",
                ],
            },
            positions: {
                "2020-12-23": [
                    {
                        symbol: "BMY",
                        averageEntryPrice: 61.48870322111941,
                        averageExitPrice: 60.601296778880595,
                        plannedEntryPrice: 61.48870322111941,
                        plannedExitPrice: 61.18870322111941,
                        plannedTargetPrice: 60.601296778880595,
                        qty: 31,
                        side: PositionDirection.long,
                        entryTime: "2020-12-23T15:19:00.000Z",
                        exitTime: "2020-12-23T15:20:00.000Z",
                        orderIds: {
                            open: "d5c94b5b-691f-4d19-9bab-8bd851d058c3",
                            close: "9270dcdb-71b3-45c6-bc9a-10f2bd74ffdd",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "UNP",
                        averageEntryPrice: 201.62223869135804,
                        averageExitPrice: 205.69328392592587,
                        plannedEntryPrice: 201.62223869135804,
                        plannedExitPrice: 202.62223869135804,
                        plannedTargetPrice: 205.69328392592587,
                        qty: 10,
                        side: PositionDirection.short,
                        entryTime: "2020-12-23T15:22:00.000Z",
                        exitTime: "2020-12-23T15:23:00.000Z",
                        orderIds: {
                            open: "e1ce33f2-adc3-47fa-bb37-7facebd8d3bc",
                            close: "22e29ff1-6781-4154-a0ba-2927e057dbd6",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "VMW",
                        averageEntryPrice: 142.0060885580247,
                        averageExitPrice: 143.0660885580247,
                        plannedEntryPrice: 142.0060885580247,
                        plannedExitPrice: 141.47608855802468,
                        plannedTargetPrice: 143.0660885580247,
                        qty: 17,
                        side: PositionDirection.long,
                        entryTime: "2020-12-23T15:05:00.000Z",
                        exitTime: "2020-12-23T15:59:00.000Z",
                        orderIds: {
                            open: "4a1a2801-adc4-4124-adc8-7387d25c62a0",
                            close: "c86c88ae-c88a-4279-b3e4-95ee8cd6398c",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "BMY",
                        averageEntryPrice: 61.204805789671546,
                        averageExitPrice: 62.0887032211194,
                        plannedEntryPrice: 61.204805789671546,
                        plannedExitPrice: 61.50480578967154,
                        plannedTargetPrice: 62.0887032211194,
                        qty: 33,
                        side: PositionDirection.short,
                        entryTime: "2020-12-23T16:21:00.000Z",
                        exitTime: "2020-12-23T16:22:00.000Z",
                        orderIds: {
                            open: "3226acdc-9a49-4c34-ac61-3f272977fbf2",
                            close: "9328e5ca-2999-4c7a-a160-24a30e89edae",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "SO",
                        averageEntryPrice: 60.19734108049383,
                        averageExitPrice: 59.89734108049383,
                        plannedEntryPrice: 60.19734108049383,
                        plannedExitPrice: 59.89734108049383,
                        plannedTargetPrice: 60.79734108049382,
                        qty: 32,
                        side: PositionDirection.long,
                        entryTime: "2020-12-23T15:01:00.000Z",
                        exitTime: "2020-12-23T16:35:00.000Z",
                        orderIds: {
                            open: "9c96749b-c4c4-4040-bbde-046e326d65c2",
                            close: "a6a63044-2f90-4d5c-88c3-71a81ab5c46c",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "DIS",
                        averageEntryPrice: 174.0400075026173,
                        averageExitPrice: 172.95,
                        plannedEntryPrice: 174.0400075026173,
                        plannedExitPrice: 172.95,
                        plannedTargetPrice: 176.22002250785192,
                        qty: 8,
                        side: PositionDirection.long,
                        entryTime: "2020-12-23T15:01:00.000Z",
                        exitTime: "2020-12-23T17:32:00.000Z",
                        orderIds: {
                            open: "d1dbc635-bafb-433b-9e0b-be790bd9a6ba",
                            close: "6539e3e9-4ed7-42d8-a9b7-062e5e26abd4",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "PLD",
                        averageEntryPrice: 97.98074485925926,
                        averageExitPrice: 96.90223457777779,
                        plannedEntryPrice: 97.98074485925926,
                        plannedExitPrice: 98.52,
                        plannedTargetPrice: 96.90223457777779,
                        qty: 18,
                        side: PositionDirection.short,
                        entryTime: "2020-12-23T15:08:00.000Z",
                        exitTime: "2020-12-23T19:26:00.000Z",
                        orderIds: {
                            open: "437e231c-8219-4c23-8e4a-db824a36fbe0",
                            close: "25236b46-cdf7-4b6e-8b39-c0d721f9b1d1",
                        },
                        totalPnl: 100,
                    },
                    {
                        symbol: "SCHW",
                        averageEntryPrice: 52.44384816460906,
                        averageExitPrice: 52.1289430617284,
                        plannedEntryPrice: 52.44384816460906,
                        plannedExitPrice: 52.1289430617284,
                        plannedTargetPrice: 53.02894306172839,
                        qty: 31,
                        side: PositionDirection.long,
                        entryTime: "2020-12-23T15:04:00.000Z",
                        exitTime: "2020-12-23T19:55:00.000Z",
                        orderIds: {
                            open: "b722a525-d468-4d8b-a59e-cc587b8d328f",
                            close: "85be60e6-4c76-4d9c-a5ad-e1ab39255242",
                        },
                        totalPnl: 100,
                    },
                ],
            },
        },
    ];

    const batchResult: BacktestBatchResult = {
        startDate: "2020-12-23",
        endDate: "2020-12-23",
        watchlist: { "2020-12-23": ["XOM", "SPY"] },
        positions: {
            "2020-12-23": [
                {
                    symbol: "SPY",
                    averageEntryPrice: 368.793326327572,
                    averageExitPrice: 369.09,
                    plannedEntryPrice: 368.793326327572,
                    plannedExitPrice: 366.7474973728395,
                    plannedTargetPrice: 372.7474973728395,
                    qty: 4,
                    side: PositionDirection.long,
                    entryTime: "2020-12-23T15:13:00.000Z",
                    exitTime: "2020-12-23T20:45:00.000Z",
                    orderIds: {
                        open: "a8afe9a4-d374-4c43-ad9a-bc65906871b3",
                        close: "a102cb06-c07a-4ada-8ed4-f9cbcb20c2b7",
                    },
                    totalPnl: 100,
                },
            ],
        },
    };

    mergeResults(results, batchResult);

    expect(results.length).toEqual(1);
    expect(results[0].watchlist[results[0].startDate]).toBeTruthy();
    expect(results[0].watchlist[results[0].startDate].length).toEqual(17);
});
