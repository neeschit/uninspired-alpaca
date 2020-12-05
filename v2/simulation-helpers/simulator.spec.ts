import { addMonths } from "date-fns";
import { Simulator } from "./simulator";
import { convertToLocalTime } from "../../src/util/date";

beforeAll(() => {
    jest.useFakeTimers("modern");
});

afterAll(() => {
    jest.useRealTimers();
});

test("Backtester - single batch", () => {
    const zonedStartDate = convertToLocalTime(
        new Date("2019-01-01"),
        " 12:00:00.000"
    );
    const zonedEndDate = convertToLocalTime(
        new Date("2019-01-31"),
        " 22:10:00.000"
    );

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    expect(result.length).toEqual(1);

    expect(result[0]).toStrictEqual({
        startDate: zonedStartDate,
        endDate: zonedEndDate,
        symbols: test,
        batchId: 0,
    });
});

test("Backtester - simulate batching", () => {
    const zonedStartDate = convertToLocalTime(
        new Date("2019-01-01"),
        " 12:00:00.000"
    );
    const zonedEndDate = convertToLocalTime(
        new Date("2019-09-01"),
        " 22:10:00.000"
    );

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test);

    expect(result.length).toEqual(9);

    const batchedEnd = addMonths(zonedStartDate, 1);
    expect(result[0]).toStrictEqual({
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: test,
        batchId: 0,
    });

    expect(result[1]).toStrictEqual({
        startDate: batchedEnd,
        endDate: addMonths(batchedEnd, 1),
        symbols: test,
        batchId: 1,
    });
});

test("Backtest - simulate batching with symbols needing batching as well", async () => {
    const zonedStartDate = convertToLocalTime(
        new Date("2019-01-01"),
        " 12:00:00.000"
    );
    const zonedEndDate = convertToLocalTime(
        new Date("2019-09-01"),
        " 22:10:00.000"
    );

    const test = ["ECL", "AAPL", "HON"];

    const result = Simulator.getBatches(zonedStartDate, zonedEndDate, test, 1);

    expect(result.length).toStrictEqual(27);

    const batchedEnd = addMonths(zonedStartDate, 1);
    expect(result[0]).toStrictEqual({
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["ECL"],
        batchId: 0,
    });
    expect(result[1]).toStrictEqual({
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["AAPL"],
        batchId: 1,
    });
    expect(result[2]).toStrictEqual({
        startDate: zonedStartDate,
        endDate: batchedEnd,
        symbols: ["HON"],
        batchId: 2,
    });
    expect(result[3]).toStrictEqual({
        startDate: batchedEnd,
        endDate: addMonths(batchedEnd, 1),
        symbols: ["ECL"],
        batchId: 3,
    });
    expect(result[4]).toStrictEqual({
        startDate: batchedEnd,
        endDate: addMonths(batchedEnd, 1),
        symbols: ["AAPL"],
        batchId: 4,
    });
    expect(result[5]).toStrictEqual({
        startDate: batchedEnd,
        endDate: addMonths(batchedEnd, 1),
        symbols: ["HON"],
        batchId: 5,
    });
});

test("Simulator should fake system time", () => {
    const b = new Simulator({
        startDate: "2015-11-25 09:00:00.000",
        endDate: "2020-11-25 09:00:00.000",
    });

    const date = new Date();

    expect(date.getTime()).toEqual(1448460000000);
    expect(date.getFullYear()).toEqual(2015);
    expect(date.getMonth()).toEqual(10);
    expect(date.getDate()).toEqual(25);
});
