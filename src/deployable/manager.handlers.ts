import {
    AlpacaOrder,
    PositionDirection,
    AlpacaPosition,
    AlpacaStreamingOrderUpdate,
} from "@neeschit/alpaca-trade-api";
import { getOrder } from "../resources/order";
import { LOGGER } from "../instrumentation/log";
import { alpaca } from "../resources/alpaca";
import {
    getPosition,
    PositionConfig,
    Position,
    getOpenPositions,
    updatePosition,
} from "../resources/position";
import { TradeManagement } from "../services/tradeManagement";
import { TradeConfig, Bar, TradePlan } from "../data/data.model";
import { getTodaysData } from "../resources/stockData";
import { postPartial } from "../util/slack";
import { postSubscriptionRequestForTickUpdates } from "./streamer.service";
import { Service } from "../util/api";

const pr = 1;

export const managerCache: TradeManagement[] = [];

export const positionCache: AlpacaPosition[] = [];
export const openOrderCache: AlpacaOrder[] = [];
export const dbPositionCache: Position[] = [];
let recentOrders: string[] = [];

export const refreshPositions = async () => {
    const pos = await alpaca.getPositions();

    positionCache.length = 0;

    positionCache.push(...pos);

    await refreshOpenOrders();

    const dbPos = await getOpenPositions();

    dbPositionCache.length = 0;
    dbPositionCache.push(...dbPos);
};

const refreshOpenOrders = async () => {
    const orders = await alpaca.getOrders({ status: "open" });

    openOrderCache.length = 0;

    openOrderCache.push(...orders);

    recentOrders = [];
};

export async function checkIfOrderIsValid(
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

export const manageOpenOrder = async (symbol: string) => {
    const openingPositionOrders = openOrderCache.filter(
        (o) => o.symbol === symbol && positionCache.every((p) => p.symbol !== o.symbol)
    );

    try {
        await Promise.all(openingPositionOrders.map(checkIfOrderIsValid));
    } catch (e) {
        LOGGER.error(e);
    }
};

export const handlePriceUpdateForPosition = async (symbol: string, bar: Bar) => {
    if (!bar) {
        LOGGER.error(`No bar found for symbol ${symbol}`);
        return;
    }
    const manager = await getManager(symbol);

    if (!manager) {
        LOGGER.error(`no manager for symbol ${symbol}`);
        return;
    }
    const openOrders = openOrderCache.filter((o) => o.symbol === symbol);
    const order = await manager.onTickUpdate(bar, openOrders);

    if (order) {
        await postPartial(order);
    }
};

export const getManager = async (symbol: string) => {
    let manager = managerCache.find(
        (m) => m.plan.symbol === symbol && m.filledPosition && m.filledPosition.quantity
    );

    if (!manager) {
        const position = dbPositionCache.find((p) => p.symbol === symbol);

        if (!position) {
            LOGGER.error(`aww hell`);
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

export const handlePositionEntry = async (trade: { plan: TradePlan; config: TradeConfig }) => {
    let manager = await getManager(trade.plan.symbol);

    if (recentOrders.some((s) => s === trade.plan.symbol)) {
        return null;
    }

    if (!manager || !manager.filledPosition || !manager.filledPosition.quantity) {
        manager = new TradeManagement(trade.config, trade.plan, pr);

        recentOrders.push(trade.plan.symbol);

        const order = await manager.queueEntry();

        if (order) {
            managerCache.push(manager);

            await refreshOpenOrders();
        }
        return order;
    }
};

export const handleOrderUpdateForSymbol = async (orderUpdate: AlpacaStreamingOrderUpdate) => {
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

    postSubscriptionRequestForTickUpdates();

    LOGGER.debug(`Position of ${position.id} updated for ${position.symbol}`);
};

export const getCallbackUrlForPositionUpdates = (symbol: string) => {
    return `http://localhost:${Service.manager}/orders/${symbol}`;
};
