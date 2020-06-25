import { alpaca } from "../resources/alpaca";
import { LOGGER } from "../instrumentation/log";
import { TickBar, TradeUpdate, OrderUpdateEvent } from "../data/data.model";
import { insertTrade } from "../resources/stockData";
import { updateOrder } from "../resources/order";
import { messageService, Service, getApiServer } from "../util/api";
import { handleSubscriptionRequest } from "./streamer.handlers";
import {
    postOrderToManage,
    postRequestToManageOpenPosition,
    postCancelledOrderToManage,
} from "./manager.interfaces";
import { postAggregatedMinuteUpdate } from "./data.interfaces";
import { postRequestToManageOpenOrders, postRequestScreenSymbol } from "./screener.interfaces";
import { subscribePath } from "./streamer.interfaces";

const server = getApiServer(Service.streamer);

const socket = alpaca.websocket;

socket.onConnect(() => {
    handleSubscriptionRequest(socket);
});

socket.onStateChange((newState) => {
    LOGGER.info(`State changed to ${newState} at ${new Date().toLocaleTimeString()}`);
    if (newState === "disconnected") {
        socket.reconnect();
    }
});

socket.onOrderUpdate((orderUpdate) => {
    if (
        orderUpdate.event === OrderUpdateEvent.fill ||
        orderUpdate.event === OrderUpdateEvent.partial_fill
    ) {
        postOrderToManage(orderUpdate).catch(LOGGER.error);
    } else if (orderUpdate.event === OrderUpdateEvent.canceled) {
        postCancelledOrderToManage(orderUpdate).catch(LOGGER.error);
    } else {
        updateOrder(orderUpdate.order, orderUpdate.position_qty, orderUpdate.price).catch(
            LOGGER.error
        );
    }
});

socket.onStockTrades(async (subject: string, data: string) => {
    const jsonData: TradeUpdate[] = JSON.parse(data);

    await insertTrade(jsonData);
});

const getBar = (d: any) => ({
    o: d.o,
    h: d.h,
    l: d.l,
    c: d.c,
    a: d.a,
    t: d.s,
    v: d.v,
    vw: d.vw,
    av: d.av,
    op: d.op,
});

socket.onStockAggMin(async (subject: string, data: any) => {
    if (typeof data === "string") {
        data = JSON.parse(data) as any[];
    }

    for (const d of data) {
        const bar: TickBar = getBar(d);

        try {
            try {
                await postAggregatedMinuteUpdate(d.sym, bar);
            } catch (e) {
                LOGGER.error(e);
            }
            postRequestScreenSymbol(d.sym, bar).catch(LOGGER.error);
            postRequestToManageOpenOrders(d.sym, bar).catch(LOGGER.error);
        } catch (e) {
            /* LOGGER.error(`Could not insert ${JSON.stringify(bar)} for ${d.sym}`); */
        }
    }
});

socket.onStockAggSec(async (subject: string, data: any) => {
    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    for (const d of data) {
        const bar: TickBar = getBar(d);

        postRequestToManageOpenPosition(d.sym, bar);
    }
});

socket.onPolygonDisconnect(() => {
    LOGGER.error(`Polygon disconnected at ${new Date().toLocaleTimeString()}`);
});

socket.onPolygonConnect(() => {
    LOGGER.error(`Polygon connected at ${new Date().toLocaleTimeString()}`);
});

server.post(subscribePath, async () => {
    try {
        await handleSubscriptionRequest(socket);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
});
