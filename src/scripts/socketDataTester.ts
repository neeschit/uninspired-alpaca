import { getSocketManager } from "../resources/polygon";
import { createReadStream, createWriteStream } from "fs";
import { LOGGER } from "../instrumentation/log";

const n = getSocketManager();

const server = n.server;

server.on("auth", () => {
    n.subscribeToTickLevelUpdates([
        "APA",
        "SPGI",
        "MPC",
        "CCL",
        "RCL",
        "EPD",
        "PXD",
        "MGM",
        "DXC",
        "VLO",
        "NCLH",
        "CQP",
        "FTNT",
        "PSX"
    ]);
});

const logOfTrades = createWriteStream("./tradeUpdates.log");

server.on("trade_update", trade => {
    logOfTrades.write(JSON.stringify(trade) + "\n");
});

server.on("close", () => {
    logOfTrades.close();
});

setTimeout(() => {
    n.close();
}, 150000 * 15);
