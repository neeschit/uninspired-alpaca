import { SimulationStrategy } from "../../v2/simulation-helpers/simulation.strategy";

export class NarrowRangeBarSimulation implements SimulationStrategy {
    beforeMarketStarts(): void {
        throw new Error("Method not implemented.");
    }
    rebalance(): void {
        throw new Error("Method not implemented.");
    }
    afterEntryTimePassed(): void {
        throw new Error("Method not implemented.");
    }
    tenMinutesToMarketClose(): void {
        throw new Error("Method not implemented.");
    }
    onMarketClose(): void {
        throw new Error("Method not implemented.");
    }
}
