import { Calendar } from "@neeschit/alpaca-trade-api";
import { runStrategy } from "../../libs/simulation-helpers/simulator";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { BrokerStrategy } from "../../libs/brokerage-helpers/brokerage.strategy";
import { SpyGapCloseSimulation } from "../../libs/strategy/spyGap.simulation";

const nrbStrategies: { [index: string]: NarrowRangeBarSimulation } = {};
const spyGapStrategies: { [index: string]: SpyGapCloseSimulation } = {};

export const rebalanceForSymbol = async (
    symbol: string,
    calendar: Calendar[],
    broker: BrokerStrategy,
    epoch = Date.now()
) => {
    if (symbol.toLowerCase() === "spy") {
        spyGapStrategies["SPY"] =
            spyGapStrategies["SPY"] || new SpyGapCloseSimulation("SPY", broker);

        await runStrategy(symbol, calendar, spyGapStrategies[symbol], epoch);

        return;
    }

    nrbStrategies[symbol] = nrbStrategies[symbol] || new NarrowRangeBarSimulation(symbol, broker);

    return runStrategy(symbol, calendar, nrbStrategies[symbol], epoch);
};
