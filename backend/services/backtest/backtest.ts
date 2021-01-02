import { currentStreamingSymbols } from "../../libs/core-utils/data/filters";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import {
    BacktestBatchResult,
    Simulator,
} from "../../libs/simulation-helpers/simulator";
import { getApiServer, Service } from "../../libs/core-utils/util/api";
import { getData } from "../../libs/core-utils/resources/stockData";
import { endOfDay } from "date-fns";
import { getCalendar } from "../../libs/brokerage-helpers/alpaca";
import { isMarketOpen } from "../../libs/simulation-helpers/timing.util";

const symbols = currentStreamingSymbols;

async function run(startDate: string, endDate: string) {
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
        return await simulator.run(batches, NarrowRangeBarSimulation);
    } catch (e) {
        LOGGER.error(e);
        return {
            totalPnl: 0,
            results: [],
        };
    }
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
