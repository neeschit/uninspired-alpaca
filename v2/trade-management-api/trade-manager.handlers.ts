import { Calendar } from "@neeschit/alpaca-trade-api";

import { getData } from "../../libs/core-utils/resources/stockData";
import { getMarketOpenMillis } from "../simulation-helpers/timing.util";
import { runStrategy } from "../simulation-helpers/simulator";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";

const nrbStrategies: { [index: string]: NarrowRangeBarSimulation } = {};

export const cancelOpenOrdersForSymbol = async (
    symbol: string,
    broker: BrokerStrategy
) => {
    const openOrders = await broker.getOpenOrders();
    const ordersForSymbol = openOrders.filter((o) => o.symbol === symbol);

    if (!ordersForSymbol.length) {
        return null;
    }

    await broker.cancelAlpacaOrder(ordersForSymbol[0].id);

    return null;
};

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

export async function getPersistedData(
    symbol: string,
    calendar: Calendar[],
    epoch: number
) {
    const data = await getData(
        symbol,
        getMarketOpenMillis(calendar, epoch),
        "5 minutes",
        epoch
    );

    const lastBar =
        Number(data[data.length - 1].n) < 5
            ? data.pop()!
            : data[data.length - 1];

    return { data, lastBar };
}
