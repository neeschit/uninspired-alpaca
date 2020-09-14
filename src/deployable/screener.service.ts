import { Service, getApiServer, messageService } from "../util/api";
import { currentTradingSymbols, currentStreamingSymbols } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { getSimpleData, cacheDailyBarsForSymbol } from "../resources/stockData";
import { addBusinessDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { screenSymbol, manageOpenOrder, refreshTrade } from "./screener.handlers";
import {
    postNewTrade,
    replaceOpenTrade,
    getCachedCurrentState,
    postOrderToCancel,
} from "./manager.interfaces";
import { TickBar, Bar } from "../data/data.model";
import { isBacktestingEnv } from "../util/env";
import { AlpacaOrder } from "@neeschit/alpaca-trade-api";
import { getLastMinuteBarFromDataService } from "./data.interfaces";
import { refreshPlanPath } from "./screener.interfaces";

const server = getApiServer(Service.screener);

const symbols = currentTradingSymbols;

const strategies: NarrowRangeBarStrategy[] = [];

if (!isBacktestingEnv()) {
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

server.post("/screen/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now(), bar }: { bar: Bar; epoch: number } = request.body || {};
    const state = await getCachedCurrentState();

    const order = await screenSymbol(strategies, symbol, bar, state, epoch);

    if (order) {
        await postNewTrade(order);
    }

    return {
        success: true,
    };
});

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

    const cachedCurrentState = await getCachedCurrentState();

    const orders = await manageOpenOrder(symbol, strategy, bar, cachedCurrentState);

    if (orders && orders.length) {
        await Promise.all(orders.map(postOrderToCancel));
    }

    return {
        success: true,
    };
});

server.post(refreshPlanPath, async (request) => {
    const symbol = request.params && request.params.symbol;

    const bar = await getLastMinuteBarFromDataService(symbol);

    const order: AlpacaOrder = request.body;

    const strategy = strategies.find((s) => s.symbol === symbol);

    if (!bar) {
        LOGGER.error(`No bar found yer for ${symbol}`);
        return {
            success: false,
        };
    }

    if (!strategy) {
        LOGGER.error("hey hey, no strategy no replacement");

        return {
            success: false,
        };
    }
    const { recentlyUpdatedDbPositions } = await getCachedCurrentState();

    return refreshTrade(symbol, strategy, recentlyUpdatedDbPositions, order, bar);
});
