import { getCalendar } from "../brokerage-helpers";
import { Simulator } from "./simulator";

beforeAll(() => {
    jest.useFakeTimers("modern");
});

afterAll(() => {
    jest.useRealTimers();
});

test("Backtester - single batch", () => {
    const zonedStartDate = "2018-12-31T17:00:00.000Z";
    const zonedEndDate = "2019-01-31T03:10:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    expect(result.length).toEqual(1);

    expect(result[0]).toStrictEqual({
        startDate: "2018-12-31T17:00:00.000Z",
        endDate: "2019-01-31T03:10:00.000Z",
        symbols: test,
        batchId: 0,
    });
});

test("Backtester - simulate batching", () => {
    const zonedStartDate = "2018-12-31T17:00:00.000Z";
    const zonedEndDate = "2019-09-01T17:00:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    expect(result.length).toEqual(9);

    expect(result[0]).toStrictEqual({
        endDate: "2019-01-31T17:00:00.000Z",
        startDate: "2018-12-31T17:00:00.000Z",
        symbols: test,
        batchId: 0,
    });

    expect(result[1]).toStrictEqual({
        endDate: "2019-02-28T17:00:00.000Z",
        startDate: "2019-01-31T17:00:00.000Z",
        symbols: test,
        batchId: 1,
    });
});

test("Backtest - simulate batching with symbols needing batching as well", async () => {
    const zonedStartDate = "2018-12-31T17:00:00.000Z";
    const zonedEndDate = "2019-09-01T17:00:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test, 1);

    expect(result.length).toStrictEqual(27);

    const expectedZoneStartDateString = "2018-12-31T17:00:00.000Z";

    const expectedFirstBatchEnd = "2019-01-31T17:00:00.000Z";

    expect(result[0]).toStrictEqual({
        startDate: expectedZoneStartDateString,
        endDate: expectedFirstBatchEnd,
        symbols: ["ECL"],
        batchId: 0,
    });
    expect(result[1]).toStrictEqual({
        startDate: expectedZoneStartDateString,
        endDate: expectedFirstBatchEnd,
        symbols: ["AAPL"],
        batchId: 1,
    });
    expect(result[2]).toStrictEqual({
        startDate: expectedZoneStartDateString,
        endDate: expectedFirstBatchEnd,
        symbols: ["HON"],
        batchId: 2,
    });

    const expectedSecondBatchEnd = "2019-02-28T17:00:00.000Z";

    expect(result[3]).toStrictEqual({
        startDate: expectedFirstBatchEnd,
        endDate: expectedSecondBatchEnd,
        symbols: ["ECL"],
        batchId: 3,
    });
    expect(result[4]).toStrictEqual({
        startDate: expectedFirstBatchEnd,
        endDate: expectedSecondBatchEnd,
        symbols: ["AAPL"],
        batchId: 4,
    });
    expect(result[5]).toStrictEqual({
        startDate: expectedFirstBatchEnd,
        endDate: expectedSecondBatchEnd,
        symbols: ["HON"],
        batchId: 5,
    });
});

test("Simulator should fake system time when executing batches", async () => {
    const zonedStartDate = "2019-01-01T00:00:00.000Z";
    const zonedEndDate = "2019-01-31T22:10:00.000Z";

    const test = ["ECL", "AAPL", "HON"];

    expect(new Date().toISOString()).not.toEqual("2019-01-31T21:00:00.000Z");

    const batches = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    const simulator = new Simulator();

    await simulator.run(batches);

    expect(new Date().toISOString()).toEqual("2019-01-31T21:00:00.000Z");
});

test("get market open time for day", async () => {
    const calendar = await getCalendar(new Date("12-11-2020"), new Date("12-12-2020"));
    const openTime = Simulator.getMarketOpenTimeForDay(1607663300000, calendar);

    expect(openTime).toEqual(1607697000000);
});

test("get market open time for a weekend", async () => {
    const calendar = await getCalendar(new Date("12-05-2020"), new Date("12-07-2020"));
    const openTime = Simulator.getMarketOpenTimeForDay(1607178600000, calendar);

    expect(openTime).toEqual(1607351400000);
});

test("get market open time without calendar", async () => {
    expect(Simulator.getMarketOpenTimeForDay.bind({}, 1607178600000, [])).toThrow(
        `no_calendar_found_2020-12-05`
    );
});
