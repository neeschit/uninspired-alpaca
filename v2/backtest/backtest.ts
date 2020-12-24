import { currentStreamingSymbols } from "../../src/data/filters";
import { LOGGER } from "../../src/instrumentation/log";
import { Simulator } from "../simulation-helpers";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";
import { MockBrokerage } from "../simulation-helpers";

const startDate = "2020-12-22 09:00:00.000";
const endDate = "2020-12-22 16:30:00.000";

const symbols = currentStreamingSymbols;

jest.mock("../brokerage-helpers", () => {
    const { MockBrokerage } = jest.requireActual(
        "../simulation-helpers/mockBrokerage"
    );
    const mockBroker = MockBrokerage.getInstance();
    const { getCalendar } = jest.requireActual("../brokerage-helpers");

    return {
        getCalendar,
        cancelAlpacaOrder: mockBroker.cancelAlpacaOrder,
        getOpenOrders: mockBroker.getOpenOrders,
        getOpenPositions: mockBroker.getOpenPositions,
        createBracketOrder: mockBroker.createBracketOrder,
        closePosition: mockBroker.closePosition,
    };
});

test("backtester for nrb", async () => {
    const mockBroker = MockBrokerage.getInstance();

    const simulator = new Simulator();

    const batches = Simulator.getBatches(startDate, endDate, symbols);

    try {
        await simulator.run(batches, NarrowRangeBarSimulation);
    } catch (e) {
        LOGGER.error(e);
    }
});
