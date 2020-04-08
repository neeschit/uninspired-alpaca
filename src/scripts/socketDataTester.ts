import { createReadStream, createWriteStream } from "fs";
import { alpaca } from "../resources/alpaca";
import { getHighVolumeCompanies } from "../data/filters";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";
import { TickBar } from "../data/data.model";
import { insertBar } from "../resources/stockData";
import { isAfterMarketClose } from "../util/market";

const highVolCompanies = getHighVolumeCompanies();

const socket = alpaca.websocket;

const logOfTrades = createWriteStream("./tradeUpdates.log");

socket.onConnect(() => {
    const mappedAggs = subscribeToTickLevelUpdates(highVolCompanies);
    socket.subscribe(["trade_updates", "account_updates", ...mappedAggs, "A.SPY"]);

    setTimeout(() => {
        socket.disconnect();
    }, 5000);
});
socket.onStateChange(newState => {
    console.log(`State changed to ${newState}`);
    if (newState === "disconnected") {
        socket.reconnect();
    }
});

socket.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
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

        try {
            await insertBar(bar, d.sym);
        } catch (e) {
            LOGGER.error(`Could not insert ${JSON.stringify(bar)} for ${d.sym}`);
        }
    }
});

setInterval(() => {
    if (isAfterMarketClose(Date.now())) {
        socket.disconnect();
    }
}, 30000);

socket.connect();
