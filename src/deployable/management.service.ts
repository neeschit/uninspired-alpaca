import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service } from "../util/api";
import { TradePlan, TradeConfig, TickBar, Bar } from "../data/data.model";
import { TradeManagement } from "../services/tradeManagement";

const managers: TradeManagement[] = [];

const server = fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

server.post("/aggregates", async (request, reply) => {
    const positions = await alpaca.getPositions();
    const barUpdates = request.body as { [index: string]: Bar[] };

    for (const position of positions) {
        let manager = managers.find(
            (m) =>
                m.plan.symbol === position.symbol && m.filledPosition && m.filledPosition.quantity
        );

        if (manager) {
            const bars = barUpdates[manager.plan.symbol];

            if (bars) {
                const order = await manager.rebalancePosition(bars[bars.length - 1]);

                if (order) {
                    manager.queueTrade(order);
                }
            }
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
            manager = new TradeManagement(trade.config, trade.plan, 1);

            await manager.queueEntry();
        }
    }

    return {
        success: true,
    };
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
