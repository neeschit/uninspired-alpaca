import { NarrowRangeBarSimulation } from "./narrowRangeBar.simulation";

jest.mock("../../src/resources/stockData");
jest.mock("../brokerage-helpers");

test("narrow range bar strategy simulation", () => {
    const nrb = new NarrowRangeBarSimulation("TEST");
});
