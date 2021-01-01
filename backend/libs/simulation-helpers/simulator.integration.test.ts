import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";
import { Simulator } from "./simulator";

beforeAll(() => {
    process.env.NODE_ENV = "backtest";
});

afterAll(() => {
    process.env.NODE_ENV = "test";
});

test("should be in 3 positions for 12-30", async () => {
    const simulator = new Simulator();

    const actualStartDate = "2020-12-30T14:00:00.000Z";
    const actualEndDate = "2020-12-30T21:30:00.000Z";

    const batches = Simulator.getBatches(
        actualStartDate,
        actualEndDate,
        ["BAC", "GS", "LLY"],
        100
    );

    const results = await simulator.run(batches, NarrowRangeBarSimulation);

    expect(results[0].positions[results[0].startDate]).toBeTruthy();
    expect(results[0].positions[results[0].startDate].length).toEqual(4);
});
