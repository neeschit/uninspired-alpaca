import { Service, getApiServer } from "../util/api";
import { TradePlan, TradeConfig } from "../data/data.model";
import { TradeManagement } from "../services/tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { AlpacaStreamingOrderUpdate } from "@neeschit/alpaca-trade-api";
import { getOrder } from "../resources/order";
import { getPosition, updatePosition } from "../resources/position";
import { postEntry } from "../util/slack";
import {
    manageOpenOrder,
    handlePriceUpdateForPosition,
    refreshPositions,
    positionCache,
    openOrderCache,
    managerCache,
    dbPositionCache,
} from "./management.handlers";

const pr = 1;

const server = getApiServer(Service.management);

server.post("/manage_open_position/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;
    const bar = request.body;

    try {
        await handlePriceUpdateForPosition(symbol, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
});

server.post("/manage_open_order/:symbol", async (request) => {
    const symbol = request.params && request.params.symbol;

    await manageOpenOrder(symbol);

    return {
        success: true,
    };
});

server.post("/trades", async (request) => {
    const currentPositions = positionCache.map((p) => p.symbol);
    const openOrderSymbols = openOrderCache.map((o) => o.symbol);

    const trades = request.body as { plan: TradePlan; config: TradeConfig }[];

    const filteredTrades = trades.filter(
        (t) =>
            currentPositions.every((p) => p !== t.plan.symbol) &&
            openOrderSymbols.every((o) => o !== t.plan.symbol)
    );

    for (const trade of filteredTrades) {
        let manager = managerCache.find(
            (m) =>
                m.plan.symbol === trade.plan.symbol && m.filledPosition && m.filledPosition.quantity
        );

        if (!manager || !manager.filledPosition) {
            manager = new TradeManagement(trade.config, trade.plan, pr);

            await manager.queueEntry();

            managerCache.push(manager);

            try {
                await postEntry(trade.plan.symbol, trade.config.t, trade.plan);
            } catch (e) {
                LOGGER.error(
                    `Trying to enter ${trade.plan.symbol} at ${new Date()} with ${JSON.stringify(
                        trade.plan
                    )}`
                );
            }
        }
    }

    return {
        success: true,
    };
});

server.get("/currentState", async () => {
    return {
        positions: positionCache,
        openOrders: openOrderCache,
        dbPositions: dbPositionCache,
    };
});

server.post("/orders/:symbol", async (request) => {
    const orderUpdate: AlpacaStreamingOrderUpdate = request.body;
    const symbol = request.params && request.params.symbol;

    LOGGER.debug(`Detected a request for ${symbol}`);

    try {
        const order = await getOrder(Number(orderUpdate.order.client_order_id));

        if (!order) {
            return null;
        }

        const position = await getPosition(Number(order.positionId));

        if (!position) {
            LOGGER.error("Didnt find position for order");
            return null;
        }

        await updatePosition(orderUpdate.position_qty, position.id, orderUpdate.price);

        await refreshPositions();

        LOGGER.debug(`Position of ${position.id} updated for ${position.symbol}`);
    } catch (e) {
        server.log.error(e);
    }
});

refreshPositions().catch(LOGGER.error);
