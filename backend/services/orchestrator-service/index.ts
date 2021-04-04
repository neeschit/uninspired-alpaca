import { endPooledConnection } from "../../libs/core-utils/connection/pg";
import { getConnectedDataWebsocket } from "../../libs/brokerage-helpers/alpaca";
import {
    onStockMinuteDataPosted,
    onStockMinuteDataPostedV2,
} from "./orchestrator";
import { AlpacaStream } from "@master-chief/alpaca";
import { currentStreamingSymbols } from "@neeschit/core-data";

export const subscribeToTickLevelUpdates = (
    symbols: string[],
    updateType: "A" | "AM" | "T" | "Q" = "A"
) => {
    return symbols.map((s) => `${updateType}.${s}`);
};

/* const socket = getConnectedDataWebsocket({
    onStockAggMin: onStockMinuteDataPosted,
    onConnect: () => {
        const defaultSubscriptions: string[] = subscribeToTickLevelUpdates(
            currentStreamingSymbols,
            "AM"
        );

        socket.subscribe(defaultSubscriptions);
    },
}); */

const stream = new AlpacaStream({
    credentials: {
        key: process.env.ALPACA_SECRET_KEY_ID!,
        secret: process.env.ALPACA_SECRET_KEY!,
    },
    type: "market_data",
    source: "sip",
});

stream.once("authenticated", () => {
    console.log("auth");
    stream.subscribe("bars", currentStreamingSymbols);
});

stream.on("bar", onStockMinuteDataPostedV2);

process.on("uncaughtException", (e) => {
    console.error(e);
});

process.on("beforeExit", () => {
    endPooledConnection();
});
