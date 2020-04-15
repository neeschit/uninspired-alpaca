import { createReadStream, createWriteStream } from "fs";
import { alpaca } from "../resources/alpaca";
import { getHighVolumeCompanies } from "../data/filters";
import { subscribeToTickLevelUpdates, getSocketManager } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";
import { TickBar, TradeUpdate } from "../data/data.model";
import { insertBar, insertTrade } from "../resources/stockData";

const highVolCompanies = getHighVolumeCompanies();

highVolCompanies.push("SPY");

const socket = alpaca.websocket;

const logOfTrades = createWriteStream("./tradeUpdates.log");

socket.onConnect(() => {
    const mappedAggMins = subscribeToTickLevelUpdates(highVolCompanies, "AM");
    const mappedAggSecs = subscribeToTickLevelUpdates(highVolCompanies, "A");
    socket.subscribe(["trade_updates", "account_updates", ...mappedAggMins, ...mappedAggSecs]);
});
socket.onStateChange((newState) => {
    console.log(`State changed to ${newState} at ${new Date().toLocaleTimeString()}`);
    if (newState === "disconnected") {
        socket.reconnect();
    }
});

socket.onOrderUpdate((data) => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
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
        data = JSON.parse(data);
    }

    for (const d of data) {
        const bar: TickBar = getBar(d);

        try {
            await insertBar(bar, d.sym, true);
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

        try {
            await insertBar(bar, d.sym);
        } catch (e) {
            /* LOGGER.error(`Could not insert ${JSON.stringify(bar)} for ${d.sym}`); */
        }
    }
});

socket.connect();
