import { endPooledConnection } from "../../libs/core-utils/connection/pg";
import { currentStreamingSymbols } from "../../libs/core-utils/data/filters";
import { getConnectedDataWebsocket } from "../../libs/brokerage-helpers/alpaca";
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
});

process.on("uncaughtException", (e) => {
    console.error(e);
});

process.on("beforeExit", () => {
    endPooledConnection();
});
