import { AlpacaStreamingClient } from "@neeschit/alpaca-trade-api";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { currentStreamingSymbols } from "../data/filters";
import { getCachedCurrentState } from "./manager.service";
import { SymbolContainingConfig } from "../data/data.model";
import { getCallbackUrlForPositionUpdates } from "./manager.handlers";
import { LOGGER } from "../instrumentation/log";

export interface SecondAggregateSubscription {
    symbol: string;
    callbackUrl: string;
}
const currentSubscriptionsCache: { [symbol: string]: string } = {};

export const missingCallbackError = new Error("callback_url_missing");

export const defaultSubscriptions: string[] = ["trade_updates", "account_updates"].concat(
    ...subscribeToTickLevelUpdates(currentStreamingSymbols, "AM")
);

export const handleSubscriptionRequest = async (socket: AlpacaStreamingClient) => {
    const { positions }: { positions: SymbolContainingConfig[] } = await getCachedCurrentState();

    const newSubscriptions = refreshSecondAggregateSubscribers(positions);
    socket.subscribe(defaultSubscriptions.concat(newSubscriptions));
};

export const refreshSecondAggregateSubscribers = (positions: SymbolContainingConfig[]) => {
    const currentPositionsMap = positions.reduce((map, p) => {
        const url = getCallbackUrlForPositionUpdates(p.symbol);
        currentSubscriptionsCache[p.symbol] = url;

        map[p.symbol] = 1;

        return map;
    }, {} as { [index: string]: number });

    Object.keys(currentSubscriptionsCache).map((symbol) => {
        currentSubscriptionsCache[symbol] = currentPositionsMap[symbol]
            ? currentSubscriptionsCache[symbol]
            : "";
    });

    const symbols = Object.keys(currentSubscriptionsCache).filter(
        (s) => currentSubscriptionsCache[s]
    );
    const newSubscriptions = subscribeToTickLevelUpdates(symbols, "A");

    return newSubscriptions;
};

export const getCacheItems = () => {
    return Object.keys(currentSubscriptionsCache).reduce((cache, symbol) => {
        if (currentSubscriptionsCache[symbol]) {
            cache[symbol] = currentSubscriptionsCache[symbol];
        }

        return cache;
    }, {} as { [symbol: string]: string });
};
