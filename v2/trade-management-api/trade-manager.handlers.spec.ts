import { Calendar } from "@neeschit/alpaca-trade-api";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import { rebalanceForSymbol, runStrategy } from "./trade-manager.handlers";

const mockAfterEntryPassed = jest.fn();
const mockBeforeMarketStarts = jest.fn();
const mockRebalance = jest.fn();
const mockWhenMarketClosing = jest.fn();
const mockOnMarketClose = jest.fn();
const mockHasEntryTimePassed = jest.fn();

const mockStrategy = {
    beforeMarketStarts: mockBeforeMarketStarts,
    afterEntryTimePassed: mockAfterEntryPassed,
    tenMinutesToMarketClose: mockWhenMarketClosing,
    onMarketClose: mockOnMarketClose,
    rebalance: mockRebalance,
    hasEntryTimePassed: mockHasEntryTimePassed,
};

test("runStrategy - afterEntryPassed", async () => {
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
