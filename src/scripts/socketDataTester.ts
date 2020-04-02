import { createReadStream, createWriteStream } from "fs";
import { alpaca } from "../resources/alpaca";
import { getHighVolumeCompanies } from "../data/filters";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";

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
socket.onStockAggSec((subject: string, data: string) => {
    LOGGER.info(data);
    return;
});

socket.connect();
