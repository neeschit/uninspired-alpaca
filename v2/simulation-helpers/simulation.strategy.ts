export interface SimulationStrategy {
    beforeMarketStarts(epoch: number): Promise<void>;
    rebalance(epoch: number): Promise<unknown>;
    tenMinutesToMarketClose(epoch: number): Promise<void>;
    onMarketClose(epoch: number): Promise<void>;
    afterEntryTimePassed(epoch: number): Promise<void>;
    hasEntryTimePassed(epoch: number): boolean;
}
