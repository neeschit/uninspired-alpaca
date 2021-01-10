import { Calendar } from "@neeschit/alpaca-trade-api";
import { ClosedMockPosition } from "./mockBrokerage";

export interface TelemetryModel {
    gap: number;
    marketGap: number;
    maxPnl: number;
}

export interface SimulationStrategy<T extends TelemetryModel> {
    beforeMarketStarts(calendar: Calendar[], epoch: number): Promise<void>;
    rebalance(calendar: Calendar[], epoch: number): Promise<unknown>;
    beforeMarketCloses(epoch: number): Promise<void>;
    onMarketClose(epoch: number): Promise<void>;
    afterEntryTimePassed(epoch: number): Promise<void>;
    hasEntryTimePassed(epoch: number): boolean;
    isInPlay(): boolean;
    logTelemetryForProfitHacking(
        position: ClosedMockPosition,
        calendar: Calendar[],
        epoch: number
    ): Promise<T>;
}
