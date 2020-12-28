import { Calendar } from "@neeschit/alpaca-trade-api";

import { getData } from "../../libs/core-utils/resources/stockData";
import { getMarketOpenMillis } from "../../libs/simulation-helpers/timing.util";
import { runStrategy } from "../../libs/simulation-helpers/simulator";
import { NarrowRangeBarSimulation } from "../../libs/strategy/narrowRangeBar.simulation";
import { BrokerStrategy } from "../../libs/brokerage-helpers/brokerage.strategy";

const nrbStrategies: { [index: string]: NarrowRangeBarSimulation } = {};

export const rebalanceForSymbol = async (
    symbol: string,
    calendar: Calendar[],
    broker: BrokerStrategy,
    epoch = Date.now()
) => {
    let sim = nrbStrategies[symbol];

    if (!sim) {
        sim = new NarrowRangeBarSimulation(symbol, broker);

        nrbStrategies[symbol] = sim;
    }

    return runStrategy(symbol, calendar, sim, epoch);
};
