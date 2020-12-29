import { currentStreamingSymbols } from "../../libs/core-utils/data/filters";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { Simulator } from "../../libs/simulation-helpers/simulator";
import { MockBrokerage } from "../../libs/simulation-helpers/mockBrokerage";
import { format, parse } from "date-fns";
import { getApiServer, Service } from "../../libs/core-utils/util/api";

const symbols = currentStreamingSymbols;

async function run(startDate: string, endDate: string) {
    const mockBroker = MockBrokerage.getInstance();

    const simulator = new Simulator();

    const actualStartDate = startDate + "T14:00:00.000Z";
    const actualEndDate = endDate + "T21:30:00.000Z";

    console.log(actualStartDate);
    console.log(actualEndDate);

    const batches = Simulator.getBatches(
        actualStartDate,
        actualEndDate,
        symbols
    );

    try {
        await simulator.run(batches, NarrowRangeBarSimulation);
        console.log(mockBroker.closedPositions.length);
    } catch (e) {
        LOGGER.error(e);
    }
}

const backtestServer = getApiServer(Service.backtest);

const dateFormat = "yyyy-MM-dd";

backtestServer.get(
    "/backtest/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        await run(startDate, endDate);

        return MockBrokerage.getInstance().closedPositions;
    }
);
