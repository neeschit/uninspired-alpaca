import {
    AlpacaOrder,
    PositionDirection,
    AlpacaPosition,
    AlpacaStreamingOrderUpdate,
    OrderStatus,
    SimpleAlpacaPosition,
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
    forceUpdatePosition,
} from "../resources/position";
import { TradeManagement } from "../services/tradeManagement";
import { TradeConfig, Bar, TradePlan } from "../data/data.model";
import { getTodaysData } from "../resources/stockData";
import { postPartial } from "../util/slack";
import { Service } from "../util/api";
import { postSubscriptionRequestForTickUpdates } from "./streamer.service";

const pr = 1;

export const managerCache: TradeManagement[] = [];

export const positionCache: AlpacaPosition[] = [];
export const openOrderCache: AlpacaOrder[] = [];
export const openDbPositionCache: Position[] = [];

let recentOrdersCache: { [index: string]: boolean } = {};

export const refreshPositions = async (refreshOrders = true) => {
    const pos = await alpaca.getPositions();

    positionCache.length = 0;

    positionCache.push(...pos);

    if (refreshOrders) await refreshOpenOrders();

    const dbPos = await getOpenPositions();

    openDbPositionCache.length = 0;
    openDbPositionCache.push(...dbPos);

    await ensureDbPositionsAreInSync(pos, dbPos);

    const dbPos1 = await getOpenPositions();

    openDbPositionCache.length = 0;
    openDbPositionCache.push(...dbPos1);
};

export const checkIfPositionsNeedRefreshing = (
    alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition },
    dbPositions: Position[]
) => {
    const unEqualPositions = dbPositions.filter((p) => {
        const alpacaPosition = alpacaPositionsMap[p.symbol];

        if (!alpacaPosition) {
            return true;
        }

        return (
            Number(alpacaPosition.qty) != p.quantity ||
            Number(alpacaPosition.avg_entry_price) != p.average_entry_price
        );
    });

    return unEqualPositions;
};

const ensureDbPositionsAreInSync = async (
    alpacaPositions: SimpleAlpacaPosition[],
    dbPositions: Position[]
) => {
    const map = alpacaPositions.reduce((map, pos) => {
        map[pos.symbol] = pos;
        return map;
    }, {} as { [index: string]: SimpleAlpacaPosition });

    const unEqualPositions = checkIfPositionsNeedRefreshing(map, dbPositions);

    for (const p of unEqualPositions) {
        const alpacaPosition = map[p.symbol];

        if (alpacaPosition) {
            await forceUpdatePosition(
                p,
                Number(alpacaPosition.qty),
                Number(alpacaPosition.avg_entry_price)
            );
        } else {
            await forceUpdatePosition(p, 0);
        }
    }
};

const refreshOpenOrders = async () => {
    const orders = await alpaca.getOrders({ status: "open" });

    openOrderCache.length = 0;

    openOrderCache.push(...orders);

    const filteredOrders = Object.keys(recentOrdersCache).filter((symbol) =>
        orders.every((o) => o.symbol !== symbol)
    );

    if (filteredOrders.length) {
        refreshPositions(false).then(() => {
            recentOrdersCache = {};
        });
    }
};

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
    return manager.checkIfPositionEntryIsInvalid(data, order);
}

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

    if (recentOrdersCache[symbol]) {
        LOGGER.warn(`not ready as there appears to be an open order`);
        return;
    }

    const openOrders = openOrderCache.filter((o) => o.symbol === symbol);
    const tradeConfig = await manager.onTickUpdate(bar, openOrders);

    if (tradeConfig) {
        await handlePositionOrderUpdate(tradeConfig, symbol, manager);
    }
};

export const handlePositionOrderUpdate = async (
    tradeConfig: TradeConfig,
    symbol: string,
    manager: TradeManagement
): Promise<AlpacaOrder | null> => {
    if (recentOrdersCache[symbol]) {
        return null;
    }
    recentOrdersCache[symbol] = true;
    const order = await manager.queueTrade(tradeConfig);
    if (order) {
        openOrderCache.push(order);
        postPartial(order).catch(LOGGER.error);
        refreshOpenOrders().catch(LOGGER.error);
        return order;
    }
    return null;
};

export const getManager = async (symbol: string) => {
    let manager = managerCache.find(
        (m) => m.plan.symbol === symbol && m.filledPosition && m.filledPosition.quantity
    );

    if (!manager) {
        const position = openDbPositionCache.find((p) => p.symbol === symbol);

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

    if (recentOrdersCache[trade.plan.symbol]) {
        return null;
    }

    if (!manager || !manager.filledPosition || !manager.filledPosition.quantity) {
        manager = new TradeManagement(trade.config, trade.plan, pr);

        recentOrdersCache[trade.plan.symbol] = true;

        const order = await manager.queueEntry();

        if (order) {
            managerCache.push(manager);

            await refreshOpenOrders();
        }
        return order;
    }
};

export const handleOrderUpdateForSymbol = async (orderUpdate: AlpacaStreamingOrderUpdate) => {
    refreshPositions().then(postSubscriptionRequestForTickUpdates).catch(LOGGER.error);

    const order = await getOrder(Number(orderUpdate.order.client_order_id));

    if (!order) {
        return null;
    }

    const position = await getPosition(Number(order.positionId));

    if (!position) {
        LOGGER.error("Didnt find position for order");
        return null;
    }

    await updatePosition(position, orderUpdate.position_qty, orderUpdate.price);

    LOGGER.debug(`Position of ${position.id} updated for ${position.symbol}`);
};

export const getCallbackUrlForPositionUpdates = (symbol: string) => {
    return `http://localhost:${Service.manager}/orders/${symbol}`;
};
