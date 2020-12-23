import { AlpacaOrder, AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { currentStreamingSymbols } from "../../src/data/filters";
import { Simulator } from "../simulation-helpers";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";

const startDate = "2020-12-22 09:00:00.000";
const endDate = "2020-12-22 16:30:00.000";

const symbols = currentStreamingSymbols;

jest.mock("../brokerage-helpers");

class MockBrokerage {
    private orders: AlpacaOrder[] = [];
    private openPositions: AlpacaPosition[] = [];

    public cancelAlpacaOrder() {}

    public getOpenOrders() {}

    public getOpenPositions() {}

    public createBracketOrder() {}

    public closePosition() {}
}

test("backtester for nrb", async () => {
    const simulator = new Simulator();

    const batches = Simulator.getBatches(startDate, endDate, symbols);

    await simulator.run(batches, NarrowRangeBarSimulation);
});
