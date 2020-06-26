import { alpaca } from "../resources/alpaca";
import { LOGGER } from "../instrumentation/log";
import { TickBar, TradeUpdate } from "../data/data.model";
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
import { OrderUpdateEvent } from "@neeschit/alpaca-trade-api";

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

const server = getApiServer(Service.streamer);

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

const socket = alpaca.data_ws;

socket.connect();

socket.onConnect(() => {
    handleSubscriptionRequest(socket);
});

socket.onStateChange((newState) => {
    LOGGER.info(`State changed to ${newState} at ${new Date().toLocaleTimeString()}`);
    if (newState === "disconnected") {
        socket.reconnect();
    }
});

socket.onDisconnect(() => {
    LOGGER.error(`Polygon disconnected at ${new Date().toLocaleTimeString()}`);
});

socket.onConnect(() => {
    LOGGER.error(`Polygon connected at ${new Date().toLocaleTimeString()}`);
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

const tradeSocket = alpaca.trade_ws;
tradeSocket.connect();

tradeSocket.onConnect(() => {
    tradeSocket.subscribe(["trade_updates", "account_updates"]);
});

tradeSocket.onStateChange((newState) => {
    LOGGER.info(`State changed to ${newState} at ${new Date().toLocaleTimeString()}`);
    if (newState === "disconnected") {
        tradeSocket.reconnect();
    }
});

tradeSocket.onDisconnect(() => {
    LOGGER.error(`Trades socket disconnected at ${new Date().toLocaleTimeString()}`);
});

tradeSocket.onConnect(() => {
    LOGGER.error(`Trades socket connected at ${new Date().toLocaleTimeString()}`);
});

tradeSocket.onOrderUpdate((orderUpdate) => {
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
/* 
tradeSocket.onStockTrades(async (subject: string, data: string) => {
    const jsonData: TradeUpdate[] = JSON.parse(data);

    await insertTrade(jsonData);
}); */
