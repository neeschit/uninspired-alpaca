import { createReadStream, createWriteStream } from "fs";
import { alpaca } from "../resources/alpaca";
import { getHighVolumeCompanies } from "../data/filters";
import { subscribeToTickLevelUpdates, getSocketManager } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";
import { TickBar, TradeUpdate } from "../data/data.model";
import { insertBar, insertTrade } from "../resources/stockData";

const highVolCompanies = getHighVolumeCompanies();

const socket = alpaca.websocket;

const logOfTrades = createWriteStream("./tradeUpdates.log");

socket.onConnect(() => {
    const mappedAggs = subscribeToTickLevelUpdates(highVolCompanies, "AM");
    socket.subscribe(["trade_updates", "account_updates", "AM.SPY", ...mappedAggs]);
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

socket.onStockAggSec(async (subject: string, data: any) => {
    LOGGER.info(data);
    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    for (const d of data) {
        const bar: TickBar = {
            o: d.o,
            h: d.h,
            l: d.l,
            c: d.c,
            a: d.a,
            t: d.s,
            v: d.v,
        };

        try {
            await insertBar(bar, d.sym);
        } catch (e) {
            LOGGER.error(`Could not insert ${JSON.stringify(bar)} for ${d.sym}`);
        }
    }
});

socket.connect();
