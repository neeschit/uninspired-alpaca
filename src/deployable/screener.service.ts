import { Service, getApiServer, messageService } from "../util/api";
import { currentTradingSymbols } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { screenSymbol } from "./screener.handlers";
import { postNewTrade } from "./manager.service";

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

export const postRequestScreenSymbol = async (symbol: string, epoch = Date.now()) => {
    try {
        return messageService(Service.screener, `/screen/${symbol}`, {
            epoch,
        });
    } catch (e) {
        LOGGER.error(e);

        return null;
    }
};

server.post("/screen/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.body || {};

    const order = await screenSymbol(strategies, symbol, epoch);

    if (order) {
        await postNewTrade(order);
    }

    return {
        success: true,
    };
});
