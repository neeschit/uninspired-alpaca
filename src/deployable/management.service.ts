import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service } from "../util/api";
import { TradePlan, TradeConfig, TickBar, Bar, PositionDirection } from "../data/data.model";
import { TradeManagement } from "../services/tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { AlpacaStreamingOrderUpdate } from "@neeschit/alpaca-trade-api";
import { getOrder } from "../resources/order";
import {
    getPosition,
    updatePosition,
    getOpenPositions,
    PositionConfig,
} from "../resources/position";
import { getTodaysData } from "../resources/stockData";
import { postEntry } from "../util/slack";

const pr = 2;

const managers: TradeManagement[] = [];

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

server.post("/aggregates", async (request, reply) => {
    const positions = await alpaca.getPositions();
    const barUpdates = request.body as { [index: string]: Bar };

    const symbols = Object.keys(request.body).filter((s) => positions.some((p) => p.symbol === s));

    const dbPositions = await getOpenPositions();

    for (const symbol of symbols) {
        let manager = managers.find(
            (m) => m.plan.symbol === symbol && m.filledPosition && m.filledPosition.quantity
        );

        if (!manager) {
            LOGGER.trace(`no manager for symbol ${symbol}`);

            const position = dbPositions.find((p) => p.symbol === symbol);

            if (!position) {
                LOGGER.error(`aww hell`);
                continue;
            }

            const unfilledPosition: PositionConfig = {
                id: position.id,
                plannedEntryPrice: position.planned_entry_price,
                plannedStopPrice: position.planned_stop_price,
                riskAtrRatio: 1,
                side: position.side as PositionDirection,
                quantity: position.planned_quantity,
                symbol,
                originalQuantity: position.planned_quantity,
            };

            manager = new TradeManagement({} as TradeConfig, unfilledPosition, 1);
            manager.position = {
                ...unfilledPosition,
            };
            manager.filledPosition = {
                ...unfilledPosition,
                originalQuantity: unfilledPosition.quantity,
                quantity: position.quantity,
                averageEntryPrice: position.average_entry_price,
                trades: [],
            };
        }

        const bar = barUpdates[manager.plan.symbol];

        if (bar) {
            const order = await manager.rebalancePosition(bar);

            if (order) {
                await manager.queueTrade(order);
            }
        } else {
            LOGGER.error(`No bar found for symbol ${symbol}`);
        }
    }

    const openOrders = await alpaca.getOrders({ status: "open" });

    const openingPositionOrders = openOrders.filter((o) =>
        positions.every((p) => p.symbol !== o.symbol)
    );

    for (const order of openingPositionOrders) {
        const myOrder = await getOrder(Number(order.client_order_id));

        if (myOrder) {
            const plannedPosition = await getPosition(myOrder.positionId);

            if (plannedPosition) {
                const unfilledPosition: PositionConfig = {
                    id: plannedPosition.id,
                    plannedEntryPrice: plannedPosition.planned_entry_price,
                    plannedStopPrice: plannedPosition.planned_stop_price,
                    riskAtrRatio: 1,
                    side: plannedPosition.side as PositionDirection,
                    quantity: plannedPosition.planned_quantity,
                    symbol: order.symbol,
                    originalQuantity: plannedPosition.planned_quantity,
                };

                const manager = new TradeManagement({} as TradeConfig, unfilledPosition, 1);
                manager.position = {
                    ...unfilledPosition,
                };

                const data = await getTodaysData(order.symbol);

                await manager.detectTrendChange(data, myOrder);
            } else {
                server.log.error(`no planned position for order`, order);
            }
        } else {
            server.log.error(`no trace for order`, order);
        }
    }

    return {
        success: true,
    };
});

server.post("/trades", async (request, reply) => {
    const positions = await alpaca.getPositions();
    const openOrders = await alpaca.getOrders({ status: "open" });

    const currentPositions = positions.map((p) => p.symbol);
    const openOrderSymbols = openOrders.map((o) => o.symbol);

    const trades = request.body as { plan: TradePlan; config: TradeConfig }[];

    const filteredTrades = trades.filter(
        (t) =>
            currentPositions.every((p) => p !== t.plan.symbol) &&
            openOrderSymbols.every((o) => o !== t.plan.symbol)
    );

    for (const trade of filteredTrades) {
        let manager = managers.find(
            (m) =>
                m.plan.symbol === trade.plan.symbol && m.filledPosition && m.filledPosition.quantity
        );

        if (!manager || !manager.filledPosition) {
            manager = new TradeManagement(trade.config, trade.plan, pr);

            await postEntry(trade.plan.symbol, trade.config.t, trade.plan);

            await manager.queueEntry();

            managers.push(manager);
        }
    }

    return {
        success: true,
    };
});

server.post("/orders", async (request, reply) => {
    const orderUpdate: AlpacaStreamingOrderUpdate = request.body;

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

        LOGGER.debug(`Position of ${position.id} updated for ${position.symbol}`);
    } catch (e) {
        server.log.error(e);
    }
});

server.get("/healthcheck", async (request, reply) => {
    return "all is well";
});

server.listen(Service.management, (err) => {
    const serverAddress = server.server && server.server.address();
    if (err || !serverAddress || typeof serverAddress === "string") {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`server listening on ${serverAddress.port}`);
});
