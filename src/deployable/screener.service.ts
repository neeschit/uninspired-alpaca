import { Service, getApiServer, messageService, isOwnedByService } from "../util/api";
import { currentTradingSymbols, currentStreamingSymbols } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData, cacheDailyBarsForSymbol } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { screenSymbol, manageOpenOrder } from "./screener.handlers";
import { postNewTrade, replaceOpenTrade } from "./manager.service";
import { TickBar, Bar } from "../data/data.model";
import { isBacktestingEnv } from "../util/env";

const server = getApiServer(Service.screener);

const symbols = currentTradingSymbols;

const strategies: NarrowRangeBarStrategy[] = [];

if (!isBacktestingEnv() && isOwnedByService(Service.screener)) {
    Promise.all(
        currentStreamingSymbols.map(async (symbol) => {
            try {
                await cacheDailyBarsForSymbol(symbol);
            } catch (e) {
                LOGGER.trace(e);
            }
            const dailyBars = await getSimpleData(
                symbol,
                addBusinessDays(Date.now(), -18).getTime()
            );
            strategies.push(
                new NarrowRangeBarStrategy({
                    symbol,
                    bars: dailyBars,
                })
            );
        })
    ).catch(LOGGER.error);
}

export const postRequestScreenSymbol = async (symbol: string, bar: Bar, epoch = Date.now()) => {
    try {
        return messageService(Service.screener, `/screen/${symbol}`, {
            epoch,
            bar,
        });
    } catch (e) {
        LOGGER.error(e);

        return null;
    }
};

server.post("/screen/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now(), bar }: { bar: Bar; epoch: number } = request.body || {};

    const order = await screenSymbol(strategies, symbol, bar, epoch);

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

    const bar: Bar = request.body;

    if (!bar) {
        LOGGER.error("hey hey, no bar no money");

        return {
            success: false,
        };
    }

    if (!strategy) {
        LOGGER.error("hey hey, no strategy no money");

        return {
            success: false,
        };
    }

    await manageOpenOrder(symbol, strategy, bar);
    return {
        success: true,
    };
});
