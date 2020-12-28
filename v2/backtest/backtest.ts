import { currentStreamingSymbols } from "../../src/data/filters.js";
import { LOGGER } from "../../src/instrumentation/log.js";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation.js";
import { Simulator } from "../simulation-helpers/simulator.js";
import { MockBrokerage } from "../simulation-helpers/mockBrokerage.js";

const startDate = "2020-12-22 09:00:00.000";
const endDate = "2020-12-22 16:30:00.000";

const symbols = currentStreamingSymbols;

async function run() {
    const mockBroker = MockBrokerage.getInstance();

    const simulator = new Simulator();

    const batches = Simulator.getBatches(startDate, endDate, symbols);

    try {
        await simulator.run(batches, NarrowRangeBarSimulation);
        console.log(mockBroker.closedPositions);
    } catch (e) {
        LOGGER.error(e);
    }
}

run()
    .then(() => {
        console.log("done");
    })
    .catch((e) => {
        LOGGER.error(e);
    });
