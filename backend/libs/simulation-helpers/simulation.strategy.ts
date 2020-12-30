import { Calendar } from "@neeschit/alpaca-trade-api";

export interface SimulationStrategy {
    beforeMarketStarts(epoch: number): Promise<void>;
    rebalance(calendar: Calendar[], epoch: number): Promise<unknown>;
    beforeMarketCloses(epoch: number): Promise<void>;
    onMarketClose(epoch: number): Promise<void>;
    afterEntryTimePassed(epoch: number): Promise<void>;
    hasEntryTimePassed(epoch: number): boolean;
    isInPlay(): boolean;
}
