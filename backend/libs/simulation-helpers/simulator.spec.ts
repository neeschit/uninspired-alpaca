import { Calendar } from "@neeschit/alpaca-trade-api";
import { getCalendar } from "../brokerage-helpers/alpaca";
import { SimulationStrategy } from "./simulation.strategy";
import { runStrategy, Simulator } from "./simulator";

beforeAll(() => {
    jest.useFakeTimers("modern");
});

afterAll(() => {
    jest.useRealTimers();
});

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
    const zonedStartDate = "2020-01-01T00:00:00.000Z";
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
