import { endPooledConnection } from "../../src/connection/pg";
import { currentStreamingSymbols } from "../../src/data/filters";
import { getConnectedDataWebsocket } from "../brokerage-helpers";
import { onStockMinuteDataPosted } from "./orchestrator";

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
    onStateChange: (newState: string) => {
        if (newState === "disconnected") {
            socket.reconnect();
        }
    },
});

process.on("uncaughtException", (e) => {
    console.error(e);
});

process.on("beforeExit", () => {
    endPooledConnection();
});
