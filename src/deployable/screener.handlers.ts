import { AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { LOGGER } from "../instrumentation/log";
import { Bar } from "../data/data.model";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getCachedCurrentState } from "./management.service";
import { getBarsFromDataService } from "./data.service";

export const screenSymbol = async (
    strategies: NarrowRangeBarStrategy[],
    symbol: string,
    currentEpoch = Date.now()
) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const { positions }: { positions: AlpacaPosition[] } = await getCachedCurrentState();

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const screenerData: Bar[] = await getBarsFromDataService(symbol, currentEpoch);

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch, positions);
};
