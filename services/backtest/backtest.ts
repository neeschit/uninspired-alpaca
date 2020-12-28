import { currentStreamingSymbols } from "../../libs/core-utils/data/filters";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { Simulator } from "../../libs/simulation-helpers/simulator";
import { MockBrokerage } from "../../libs/simulation-helpers/mockBrokerage";
import { format } from "date-fns";
import { getApiServer, Service } from "../../libs/core-utils/util/api";

const startDate = "2020-12-23";
const endDate = "2020-12-23";

const symbols = currentStreamingSymbols;

async function run(startDate: string, endDate: string) {
    const mockBroker = MockBrokerage.getInstance();

    const simulator = new Simulator();

    const batches = Simulator.getBatches(
        startDate + "T14:00:00.000Z",
        endDate + "T21:30:00.000Z",
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

backtestServer.get("/backtest/:startDate/:endDate", async (request) => {
    const startDate = request.params.startDate;
    const endDate = request.params.endDate;

    await run(
        format(new Date(startDate), dateFormat),
        format(new Date(endDate), dateFormat)
    );

    return MockBrokerage.getInstance().closedPositions;
});
