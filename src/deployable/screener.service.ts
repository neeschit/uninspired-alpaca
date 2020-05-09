import { Service, messageService, getApiServer, getFromService } from "../util/api";
import { getMegaCaps } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { Bar } from "../data/data.model";

const server = getApiServer(Service.screener);

const megacaps = getMegaCaps();

const strategies: NarrowRangeBarStrategy[] = [];

Promise.all(
    megacaps.map(async (symbol) => {
        const dailyBars = await getSimpleData(symbol, addBusinessDays(Date.now(), -18).getTime());
        strategies.push(
            new NarrowRangeBarStrategy({
                symbol,
                bars: dailyBars,
            })
        );
    })
)
    .then(() => screenSymbol("AAPL"))
    .catch(LOGGER.error);

server.post("/screen/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    const order = await screenSymbol(symbol);

    if (order) {
        await messageService(Service.management, `/order/${symbol}`, order);
    }

    return {
        success: true,
    };
});

const screenSymbol = async (symbol: string) => {
    const strategy = strategies.find((s) => s.symbol === symbol);

    const { positions }: { positions: AlpacaPosition[] } = (await getFromService(
        Service.management,
        "/currentState"
    )) as any;

    if (!strategy) {
        LOGGER.warn(`Is this possible? ${symbol}`);
        return null;
    }

    const currentEpoch = Date.now();

    const screenerData: Bar[] = (await getFromService(Service.data, "/bars/" + symbol, {
        epoch: currentEpoch,
    })) as any;

    strategy.screenForNarrowRangeBars(screenerData, currentEpoch);

    return strategy.rebalance(screenerData, currentEpoch, positions);
};

const screenSymbols = (symbols: string[]) => {
    return symbols.map(screenSymbol);
};
