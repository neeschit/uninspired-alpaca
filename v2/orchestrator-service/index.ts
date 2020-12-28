import { endPooledConnection } from "../../src/connection/pg.js";
import { currentStreamingSymbols } from "../../src/data/filters.js";
import { getConnectedDataWebsocket } from "../brokerage-helpers/alpaca.js";
import { onStockMinuteDataPosted } from "./orchestrator.js";

export const subscribeToTickLevelUpdates = (
    symbols: string[],
    updateType: "A" | "AM" | "T" | "Q" = "A"
) => {
    return symbols.map((s) => `${updateType}.${s}`);
};

const socket = getConnectedDataWebsocket({
    onStockAggMin: onStockMinuteDataPosted,
    onConnect: () => {
        const defaultSubscriptions: string[] = subscribeToTickLevelUpdates(
            currentStreamingSymbols,
            "AM"
        );

        socket.subscribe(defaultSubscriptions);
    },
});

process.on("uncaughtException", (e) => {
    console.error(e);
});

process.on("beforeExit", () => {
    endPooledConnection();
});
