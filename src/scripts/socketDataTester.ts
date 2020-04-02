import { createReadStream, createWriteStream } from "fs";
import { alpaca } from "../resources/alpaca";
import { getHighVolumeCompanies } from "../data/filters";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";
import { TickBar } from "../data/data.model";
import { insertBar } from "../resources/stockData";

const highVolCompanies = getHighVolumeCompanies();

const socket = alpaca.websocket;

const logOfTrades = createWriteStream("./tradeUpdates.log");

socket.onConnect(() => {
    const mappedAggs = subscribeToTickLevelUpdates(highVolCompanies);
    socket.subscribe(["trade_updates", "account_updates", ...mappedAggs]);
});
socket.onStateChange(newState => {
    console.log(`State changed to ${newState}`);
});

socket.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
});

socket.onStockAggMin((subject: string, data: string) => {
    LOGGER.info(subject);
    return;
});
socket.onStockTrades((subject: string, data: string) => {
    LOGGER.info(subject);
    return;
});
socket.onStockAggSec(async (subject: string, data: any) => {
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
            v: d.v
        };

        await insertBar(bar, d.sym);
    }
});

socket.connect();
