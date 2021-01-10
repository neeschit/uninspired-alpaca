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
import {
    getData,
    getEarliestDate,
} from "../../libs/core-utils/resources/stockData";
import { addBusinessDays, endOfDay } from "date-fns";
import { getCalendar } from "../../libs/brokerage-helpers/alpaca";
import { isMarketOpen } from "../../libs/simulation-helpers/timing.util";
import { ensureDir, readdir, readJSON, writeJson, ensureFile } from "fs-extra";
import { SpyGapCloseSimulation } from "../../libs/strategy/spyGap.simulation";
import { BoomBarSimulation } from "../../libs/strategy/boomBar.simulation";
import { TelemetryModel } from "../../libs/simulation-helpers/simulation.strategy";

async function run<T extends TelemetryModel>(
    startDate: string,
    endDate: string,
    Strategy: SimulationImpl<T>,
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
        return await simulator.run(
            batches,
            Strategy,
            actualStartDate,
            actualEndDate
        );
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

backtestServer.get("/mindate", async () => {
    const earliestDay = await getEarliestDate("SPY");

    if (!earliestDay || !earliestDay.length) {
        return Date.now();
    }

    return earliestDay[0].t;
});

backtestServer.get(
    "/nrb/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const simulationResults = await run(
            startDate,
            endDate,
            NarrowRangeBarSimulation,
            currentStreamingSymbols
        );

        const results = {
            ...simulationResults,
            strategy: "Model 1",
        };

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
    "/spyGap/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const simulationResults = await run(
            startDate,
            endDate,
            SpyGapCloseSimulation,
            ["SPY"]
        );

        const results = {
            ...simulationResults,
            strategy: "Model 2",
        };

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
    "/boom/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const simulationResults = await run(
            startDate,
            endDate,
            BoomBarSimulation,
            currentTradingSymbols
        );

        const results = {
            ...simulationResults,
            strategy: "Model 3",
        };

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

        const data = await getData(
            symbol,
            addBusinessDays(fromEpoch, -3).getTime(),
            duration,
            endEpoch
        );

        const calendar = await getCalendar(
            new Date(addBusinessDays(fromEpoch, -3)),
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
