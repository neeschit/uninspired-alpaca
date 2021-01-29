import { TelemetryModel } from "../../libs/simulation-helpers/simulation.strategy";
import {
    SimulationImpl,
    SimulationResult,
} from "../../libs/simulation-helpers/simulator";
import { BoomBarSimulation } from "../../libs/strategy/boomBar.simulation";
import { BoomBarBreakoutSimulation } from "../../libs/strategy/boomBreakout.simulation";
import { GapAndGoSimulation } from "../../libs/strategy/gapAndGo.simulation";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { SpyGapCloseSimulation } from "../../libs/strategy/spyGap.simulation";

export interface ChartingBar {
    time: any;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export const STRATEGY_MAP: {
    [index: string]: SimulationImpl<TelemetryModel>;
} = {
    "Model 1": NarrowRangeBarSimulation,
    "Model 2": SpyGapCloseSimulation,
    "Model 3": BoomBarSimulation,
    "Model 4": GapAndGoSimulation,
    "Model 5": BoomBarBreakoutSimulation,
};

export interface BacktestResult extends SimulationResult {
    strategy: string;
}
