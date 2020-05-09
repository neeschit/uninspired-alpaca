import { AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { getFromService, Service } from "../util/api";
import { LOGGER } from "../instrumentation/log";
import { Bar } from "../data/data.model";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";

export const screenSymbol = async (
    strategies: NarrowRangeBarStrategy[],
    symbol: string,
    currentEpoch = Date.now()
) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const { positions }: { positions: AlpacaPosition[] } = (await getFromService(
        Service.management,
        "/currentState"
    )) as any;

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const screenerData: Bar[] = (await getFromService(Service.data, "/bars/" + symbol, {
        epoch: currentEpoch,
    })) as any;

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch, positions);
};
