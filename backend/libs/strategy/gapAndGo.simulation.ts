import { Calendar } from "@neeschit/alpaca-trade-api";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getGapForSymbol } from "../core-utils/resources/stockData";
import { ClosedMockPosition } from "../simulation-helpers/mockBrokerage";
import {
    SimulationStrategy,
    TelemetryModel,
} from "../simulation-helpers/simulation.strategy";
import { Simulator } from "../simulation-helpers/simulator";
import { FIFTEEN_MINUTES } from "../simulation-helpers/timing.util";

export class GapAndGoSimulation implements SimulationStrategy<TelemetryModel> {
    private hasGap = false;
    constructor(private symbol: string, public broker: BrokerStrategy) {}

    async beforeMarketStarts(calendar: Calendar[], epoch: number) {
        const marketOpenToday = Simulator.getMarketOpenTimeForDay(
            epoch,
            calendar
        );

        const marketOpenYday = Simulator.getMarketOpenTimeForYday(
            epoch,
            calendar
        );

        const gapToday = await getGapForSymbol(
            this.symbol,
            marketOpenYday,
            epoch,
            marketOpenToday - 2 * FIFTEEN_MINUTES,
            marketOpenToday
        );

        this.hasGap = gapToday > 2.9 || gapToday < -2.9;
    }
    async rebalance(calendar: Calendar[], epoch: number) {}
    async beforeMarketCloses(epoch: number) {}
    async onMarketClose(epoch: number) {}
    async afterEntryTimePassed(epoch: number) {}
    hasEntryTimePassed(epoch: number) {
        return false;
    }
    isInPlay() {
        return this.hasGap;
    }

    private telemetryModel: TelemetryModel = {
        marketGap: 0,
        maxPnl: 0,
        gap: 0,
    };
    async logTelemetryForProfitHacking(
        position: ClosedMockPosition,
        calendar: Calendar[],
        epoch: number
    ) {
        return this.telemetryModel;
    }
}
