import { Service, getApiServer, messageService } from "../util/api";
import { currentTradingSymbols, currentStreamingSymbols } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData, cacheDailyBarsForSymbol } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { screenSymbol, manageOpenOrder } from "./screener.handlers";
import { postNewTrade } from "./manager.service";
import { TickBar } from "../data/data.model";

const server = getApiServer(Service.screener);

const symbols = currentTradingSymbols;

const strategies: NarrowRangeBarStrategy[] = [];

Promise.all(
    currentStreamingSymbols.map(async (symbol) => {
        try {
            await cacheDailyBarsForSymbol(symbol);
        } catch (e) {
            LOGGER.trace(e);
        }
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

export const postRequestToManageOpenOrders = async (symbol: string, bar: TickBar) => {
    try {
        return messageService(Service.screener, `/manage_open_order/${symbol}`, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

server.post("/manage_open_order/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    const strategy = strategies.find((s) => s.symbol === symbol);

    if (!strategy) {
        LOGGER.error("hey hey, no strategy no money");

        return {
            success: false,
        };
    }

    await manageOpenOrder(symbol, strategy);

    return {
        success: true,
    };
});
