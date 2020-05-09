import { Service, messageService, getApiServer } from "../util/api";
import { getMegaCaps, currentTradingSymbols } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { screenSymbol } from "./screener.handlers";

const server = getApiServer(Service.screener);

const symbols = currentTradingSymbols;

const strategies: NarrowRangeBarStrategy[] = [];

Promise.all(
    symbols.map(async (symbol) => {
        const dailyBars = await getSimpleData(symbol, addBusinessDays(Date.now(), -18).getTime());
        strategies.push(
            new NarrowRangeBarStrategy({
                symbol,
                bars: dailyBars,
            })
        );
    })
).catch(LOGGER.error);

server.post("/screen/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.body || {};

    const order = await screenSymbol(strategies, symbol, epoch);

    if (order) {
        await messageService(Service.management, `/order/${symbol}`, order);
    }

    return {
        success: true,
    };
});
