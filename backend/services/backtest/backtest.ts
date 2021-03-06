import {
    currentStreamingSymbols,
    currentTradingSymbols,
    getLargeCaps,
} from "@neeschit/core-data";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import {
    AggregatedBacktestBatchResult,
    getBatchesForRetry,
    SimulationImpl,
    SimulationResult,
    Simulator,
} from "../../libs/simulation-helpers/simulator";
import { getApiServer, Service } from "../../libs/core-utils/util/api";
import {
    getData,
    getEarliestDate,
    getLatestDate,
} from "../../libs/core-utils/resources/stockData";
import { addBusinessDays, endOfDay } from "date-fns";
import { getCalendar } from "../../libs/brokerage-helpers/alpaca";
import { isMarketOpen } from "../../libs/simulation-helpers/timing.util";
import { ensureDir, readdir, readJSON, writeJson, ensureFile } from "fs-extra";
import { SpyGapCloseSimulation } from "../../libs/strategy/spyGap.simulation";
import { BoomBarSimulation } from "../../libs/strategy/boomBar.simulation";
import { TelemetryModel } from "../../libs/simulation-helpers/simulation.strategy";
import { GapAndGoSimulation } from "../../libs/strategy/gapAndGo.simulation";
import { BoomBarBreakoutSimulation } from "../../libs/strategy/boomBreakout.simulation";
import { BacktestResult, ChartingBar, STRATEGY_MAP } from "./backtestModel";

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

backtestServer.get("/minmaxdate", async () => {
    const earliestDayData = await getEarliestDate("SPY");
    const latestDayData = await getLatestDate("SPY");

    const earliestDay =
        (earliestDayData?.length && earliestDayData[0].t) || Date.now();

    const latestDay =
        (latestDayData?.length && latestDayData[0].t) || Date.now();

    return {
        earliestDay,
        latestDay,
    };
});

const getFileName = (startDate: string, endDate: string) => {
    return `./backtests/${startDate}-${endDate}-${Date.now()}.json`;
};

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
            const filename = getFileName(startDate, endDate);
            await ensureFile(filename);

            await writeJson(filename, results);
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
            const filename = getFileName(startDate, endDate);
            await ensureFile(filename);

            await writeJson(filename, results);
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

        const filename = getFileName(startDate, endDate);

        try {
            await ensureFile(filename);

            await writeJson(filename, results);
        } catch (e) {
            LOGGER.error(e);
        }

        return results;
    }
);

backtestServer.get(
    "/boomBreakout/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const simulationResults = await run(
            startDate,
            endDate,
            BoomBarBreakoutSimulation,
            currentTradingSymbols
        );

        const results = {
            ...simulationResults,
            strategy: "Model 5",
        };

        const filename = getFileName(startDate, endDate);

        try {
            await ensureFile(filename);

            await writeJson(filename, results);
        } catch (e) {
            LOGGER.error(e);
        }

        return results;
    }
);

backtestServer.get(
    "/gapAndGo/:startDate/:endDate",
    async (request: { params: any }) => {
        const startDate = request.params.startDate;
        const endDate = request.params.endDate;

        const simulationResults = await run(
            startDate,
            endDate,
            GapAndGoSimulation,
            currentTradingSymbols
        );

        const results = {
            ...simulationResults,
            strategy: "Model 4",
        };

        const filename = getFileName(startDate, endDate);

        try {
            await ensureFile(filename);

            await writeJson(filename, results);
        } catch (e) {
            LOGGER.error(e);
        }

        return results;
    }
);

async function rerun<T extends TelemetryModel>(
    Strategy: SimulationImpl<T>,
    backtest: BacktestResult
) {
    const simulator = new Simulator();

    const { startDate, endDate, batches } = getBatchesForRetry(backtest);

    try {
        return await simulator.run(batches, Strategy, startDate, endDate);
    } catch (e) {
        LOGGER.error(e);
        return {
            totalPnl: 0,
            results: [],
        };
    }
}

backtestServer.post("/retry", async (request: { body: BacktestResult }) => {
    const Strategy = STRATEGY_MAP[request.body.strategy];

    const simulationResults = await rerun(Strategy, request.body);

    const results = {
        ...simulationResults,
        strategy: request.body.strategy,
    };

    const days = request.body.results;

    const startDate = days[0].startDate;
    const endDate = days[days.length - 1].endDate;

    const filename = getFileName(startDate, endDate);

    try {
        await ensureFile(filename);

        await writeJson(filename, results);
    } catch (e) {
        LOGGER.error(e);
    }

    return results;
});

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
