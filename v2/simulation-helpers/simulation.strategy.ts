export interface SimulationStrategy {
    beforeMarketStarts(): void;
    rebalance(): void;
    afterEntryTimePassed(): void;
    tenMinutesToMarketClose(): void;
    onMarketClose(): void;
}
