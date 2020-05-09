import { alpaca } from "../resources/alpaca";
import { getLargeCaps, getMegaCaps } from "../data/filters";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";
import { TickBar, TradeUpdate, Bar, OrderUpdateEvent } from "../data/data.model";
import { insertBar, insertTrade } from "../resources/stockData";
import { updateOrder } from "../resources/order";
import { messageService, Service, getApiServer, getFromService } from "../util/api";
import { AlpacaPosition } from "@neeschit/alpaca-trade-api";

const highVolCompanies = getMegaCaps();

highVolCompanies.push("SPY");

const server = getApiServer(Service.streamer);

const socket = alpaca.websocket;

interface SecondAggregateSubscription {
    symbol: string;
    callbackUrl: string;
}

const currentSubscriptions: { [symbol: string]: string } = {};
const defaultSubscriptions: string[] = ["trade_updates", "account_updates"].concat(
    ...subscribeToTickLevelUpdates(highVolCompanies, "AM")
);

socket.onConnect(() => {
    socket.subscribe(defaultSubscriptions);
});
socket.onStateChange((newState) => {
    console.log(`State changed to ${newState} at ${new Date().toLocaleTimeString()}`);
    if (newState === "disconnected") {
        socket.reconnect();
    }
});

socket.onOrderUpdate((orderUpdate) => {
    updateOrder(orderUpdate.order, orderUpdate.position_qty, orderUpdate.price).catch(LOGGER.error);
    if (
        orderUpdate.event === OrderUpdateEvent.fill ||
        orderUpdate.event === OrderUpdateEvent.partial_fill
    ) {
        messageService(Service.management, "/orders/" + orderUpdate.order.symbol, orderUpdate);
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
                await messageService(Service.data, `/bar/${d.sym}`, bar);
            } catch (e) {
                LOGGER.error(e);
            }
            messageService(Service.screener, `/screen/${d.sym}`, bar).catch(LOGGER.error);
            messageService(Service.management, `/manage_open_order/${d.sym}`, bar).catch(
                LOGGER.error
            );
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

        messageService(Service.management, `/manage_open_order/${d.sym}`, bar).catch(LOGGER.error);
    }
});

socket.onPolygonDisconnect(() => {
    LOGGER.error(`Polygon disconnected at ${new Date().toLocaleTimeString()}`);
});

socket.onPolygonConnect(() => {
    LOGGER.error(`Polygon connected at ${new Date().toLocaleTimeString()}`);
});

socket.connect();

const handleSubscriptionRequest = async (subscriptionRequests: SecondAggregateSubscription[]) => {
    const { positions }: { positions: AlpacaPosition[] } = (await getFromService(
        Service.management,
        "/currentState"
    )) as any;

    const filteredRequests = subscriptionRequests.filter(
        (s) => s.callbackUrl && !currentSubscriptions[s.symbol]
    );

    for (const req of filteredRequests) {
        currentSubscriptions[req.symbol] = req.callbackUrl;
    }

    const filteredSymbols = Object.keys(currentSubscriptions).filter((s) => {
        const isCurrentPosition = positions.some((p) => p.symbol === s);

        if (!isCurrentPosition) {
            LOGGER.warn(`Symbol ${s} is not a current position, not listening to tick updates`);
        }

        return isCurrentPosition;
    });

    const newSubscriptions = subscribeToTickLevelUpdates(filteredSymbols, "A");

    socket.subscribe(defaultSubscriptions.concat(newSubscriptions));

    return {
        success: true,
    };
};

server.post("/subscribe", async (request, reply) => {
    const subscriptionRequests: SecondAggregateSubscription[] = request.body;

    return handleSubscriptionRequest(subscriptionRequests);
});
