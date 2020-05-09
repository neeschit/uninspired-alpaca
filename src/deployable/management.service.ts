import { Server, IncomingMessage, ServerResponse } from "http";
import { alpaca } from "../resources/alpaca";
import { Service, getApiServer } from "../util/api";
import { TradePlan, TradeConfig, TickBar, Bar, PositionDirection } from "../data/data.model";
import { TradeManagement } from "../services/tradeManagement";
import { LOGGER } from "../instrumentation/log";
import {
    AlpacaStreamingOrderUpdate,
    AlpacaPosition,
    AlpacaOrder,
} from "@neeschit/alpaca-trade-api";
import { getOrder } from "../resources/order";
import {
    getPosition,
    updatePosition,
    getOpenPositions,
    PositionConfig,
    Position,
} from "../resources/position";
import { getTodaysData } from "../resources/stockData";
import { postPartial, postEntry } from "../util/slack";

const pr = 1;

const managers: TradeManagement[] = [];

const server = getApiServer(Service.management);

server.post("/manage_open_position/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const bar = request.body;

    try {
        await handlePriceUpdateForPosition(symbol, dbPositions, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
});

const positions: AlpacaPosition[] = [];
const openOrders: AlpacaOrder[] = [];
const dbPositions: Position[] = [];

const refreshPositions = async () => {
    const pos = await alpaca.getPositions();

    positions.length = 0;

    positions.push(...pos);

    const orders = await alpaca.getOrders({ status: "open" });

    openOrders.length = 0;

    openOrders.push(...orders);

    const dbPos = await getOpenPositions();

    dbPositions.length = 0;
    dbPositions.push(...dbPos);

    throw new Error("hello");
};

export const getManager = async (symbol: string, dbPositions: Position[]) => {
    let manager = managers.find(
        (m) => m.plan.symbol === symbol && m.filledPosition && m.filledPosition.quantity
    );

    if (!manager) {
        const position = dbPositions.find((p) => p.symbol === symbol);

        if (!position) {
            LOGGER.error(`aww hell`);
            return null;
        }

        if (openOrders.some((o) => o.symbol === symbol)) {
            LOGGER.warn(`profit order already exists`);
            return null;
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
            originalQuantity: position.planned_quantity,
            quantity: position.quantity,
            averageEntryPrice: position.average_entry_price,
            trades: [],
        };
    }

    return manager;
};

export const handlePriceUpdateForPosition = async (
    symbol: string,
    dbPositions: Position[],
    bar: Bar
) => {
    if (!bar) {
        LOGGER.error(`No bar found for symbol ${symbol}`);
        return;
    }
    const manager = await getManager(symbol, dbPositions);

    if (!manager) {
        LOGGER.error(`no manager for symbol ${symbol}`);
        return;
    }
    const order = await manager.onTickUpdate(bar);

    if (order) await postPartial(order);
};

server.post("/manage_open_order/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;

    const openingPositionOrders = openOrders.filter(
        (o) => o.symbol === symbol && positions.every((p) => p.symbol !== o.symbol)
    );

    try {
        await Promise.all(openingPositionOrders.map(checkIfOrderIsValid));
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
});

server.post("/trades", async (request, reply) => {
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

            await manager.queueEntry();

            managers.push(manager);

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

server.get("/currentState", async (request, reply) => {
    return {
        positions,
        openOrders,
        dbPositions,
    };
});

server.post("/orders/:symbol", async (request, reply) => {
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

async function checkIfOrderIsValid(
    order: AlpacaOrder,
    index: number,
    openingPositionOrders: AlpacaOrder[]
): Promise<boolean> {
    const myOrder = await getOrder(Number(order.client_order_id));

    if (openingPositionOrders.findIndex((or) => or.symbol === order.symbol) !== index++) {
        LOGGER.error(`this is excessively weird`, order);
        await alpaca.cancelOrder(order.id);
        return false;
    }

    if (!myOrder) {
        LOGGER.error(`no trace for order`, order);
        await alpaca.cancelOrder(order.id);
        return false;
    }

    const plannedPosition = await getPosition(myOrder.positionId);

    if (!plannedPosition) {
        LOGGER.error(`no planned position for order`, order);
        await alpaca.cancelOrder(order.id);
        return false;
    }

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
    return manager.detectTrendChange(data, order);
}

refreshPositions().catch(LOGGER.error);
