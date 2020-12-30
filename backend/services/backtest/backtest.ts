import { currentStreamingSymbols } from "../../libs/core-utils/data/filters";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { Simulator } from "../../libs/simulation-helpers/simulator";
import {
    ClosedMockPosition,
    MockBrokerage,
} from "../../libs/simulation-helpers/mockBrokerage";
import { getApiServer, Service } from "../../libs/core-utils/util/api";

const symbols = currentStreamingSymbols;

async function run(startDate: string, endDate: string) {
    const mockBroker = MockBrokerage.getInstance();

    const simulator = new Simulator();

    const actualStartDate = startDate + "T14:00:00.000Z";
    const actualEndDate = endDate + "T21:30:00.000Z";

    const batches = Simulator.getBatches(actualStartDate, actualEndDate, [
        "BMY",
    ]);

    let closedPositions: ClosedMockPosition[] = [];

    try {
        await simulator.run(batches, NarrowRangeBarSimulation);
        closedPositions = MockBrokerage.getInstance().closedPositions;
    } catch (e) {
        LOGGER.error(e);
    } finally {
        MockBrokerage.getInstance().reset();
    }

    return closedPositions;
}

const backtestServer = getApiServer(Service.backtest);

backtestServer.get(
    "/backtest/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const results = await run(startDate, endDate);

        return results;
    }
);
