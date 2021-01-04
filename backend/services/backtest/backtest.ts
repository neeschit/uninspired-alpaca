import {
    currentStreamingSymbols,
    currentTradingSymbols,
} from "../../libs/core-utils/data/filters";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import {
    SimulationImpl,
    Simulator,
} from "../../libs/simulation-helpers/simulator";
import { getApiServer, Service } from "../../libs/core-utils/util/api";
import { getData } from "../../libs/core-utils/resources/stockData";
import { endOfDay } from "date-fns";
import { getCalendar } from "../../libs/brokerage-helpers/alpaca";
import { isMarketOpen } from "../../libs/simulation-helpers/timing.util";
import {
    ensureDir,
    readJson,
    readdir,
    readJSON,
    writeJson,
    ensureFile,
} from "fs-extra";
import { SimulationStrategy } from "../../libs/simulation-helpers/simulation.strategy";
import { SpyGapCloseSimulation } from "../../libs/strategy/spyGap.simulation";

async function run(
    startDate: string,
    endDate: string,
    Strategy: SimulationImpl,
    symbols: string[]
) {
    const simulator = new Simulator();

    const actualStartDate = startDate + "T14:00:00.000Z";
    const actualEndDate = endDate + "T21:30:00.000Z";

    const batches = Simulator.getBatches(
        actualStartDate,
        actualEndDate,
        symbols,
        100
    );

    try {
        return await simulator.run(batches, Strategy);
    } catch (e) {
        LOGGER.error(e);
        return {
            totalPnl: 0,
            results: [],
        };
    }
}

const backtestServer = getApiServer(Service.backtest);

backtestServer.get("/cached", async () => {
    try {
        await ensureDir("./backtests");

        const files = await readdir("./backtests");

        const jsonFiles = await Promise.all(
            files.map((f) => readJSON("./backtests/" + f))
        );

        return jsonFiles;
    } catch (e) {
        LOGGER.error(e);
        return [];
    }
});

backtestServer.get(
    "/backtest/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const results = await run(
            startDate,
            endDate,
            NarrowRangeBarSimulation,
            currentStreamingSymbols
        );

        try {
            await ensureFile(`./backtests/${startDate}-${endDate}.json`);

            await writeJson(
                `./backtests/${startDate}-${endDate}.json`,
                results
            );
        } catch (e) {
            LOGGER.error(e);
        }

        return results;
    }
);

backtestServer.get(
    "/experiment/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const results = await run(startDate, endDate, SpyGapCloseSimulation, [
            "SPY",
        ]);

        try {
            await ensureFile(`./backtests/${startDate}-${endDate}.json`);

            await writeJson(
                `./backtests/${startDate}-${endDate}.json`,
                results
            );
        } catch (e) {
            LOGGER.error(e);
        }

        return results;
    }
);

export interface ChartingBar {
    time: any;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

backtestServer.post(
    "/fetchBars",
    async (request: { body: any }): Promise<ChartingBar[]> => {
        const {
            symbol,
            fromEpoch,
            duration,
        }: {
            symbol: string;
            fromEpoch: number;
            duration: string;
        } = request.body;

        const endEpoch = endOfDay(fromEpoch).getTime();

        const data = await getData(symbol, fromEpoch, duration, endEpoch);

        const calendar = await getCalendar(
            new Date(fromEpoch),
            new Date(endEpoch)
        );

        const mappedData = data
            .filter((d) => isMarketOpen(calendar, d.t))
            .map((d) => {
                return {
                    time: d.t / 1000,
                    open: d.o,
                    close: d.c,
                    low: d.l,
                    high: d.h,
                    volume: d.v,
                };
            });

        return mappedData;
    }
);
