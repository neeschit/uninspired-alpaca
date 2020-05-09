import Alpaca, { AlpacaPosition, AlpacaStreamingClient } from "@neeschit/alpaca-trade-api";
import { getFromService, Service } from "../util/api";
import { LOGGER } from "../instrumentation/log";
import { subscribeToTickLevelUpdates } from "../resources/polygon";
import { currentStreamingSymbols } from "../data/filters";

export interface SecondAggregateSubscription {
    symbol: string;
    callbackUrl: string;
}
const currentSubscriptionsCache: { [symbol: string]: string } = {};

export const defaultSubscriptions: string[] = ["trade_updates", "account_updates"].concat(
    ...subscribeToTickLevelUpdates(currentStreamingSymbols, "AM")
);

export const handleSubscriptionRequest = async (
    subscriptionRequests: SecondAggregateSubscription[],
    socket: AlpacaStreamingClient
) => {
    const { positions }: { positions: AlpacaPosition[] } = (await getFromService(
        Service.management,
        "/currentState"
    )) as any;

    const filteredRequests = subscriptionRequests.filter(
        (s) => s.callbackUrl && !currentSubscriptionsCache[s.symbol]
    );

    for (const req of filteredRequests) {
        currentSubscriptionsCache[req.symbol] = req.callbackUrl;
    }

    const filteredSymbols = Object.keys(currentSubscriptionsCache).filter((s) => {
        const isCurrentPosition = positions.some((p) => p.symbol === s);

        if (!isCurrentPosition) {
            LOGGER.warn(`Symbol ${s} is not a current position, not listening to tick updates`);
        }

        return isCurrentPosition;
    });

    const newSubscriptions = subscribeToTickLevelUpdates(filteredSymbols, "A");

    socket.subscribe(defaultSubscriptions.concat(newSubscriptions));

    return {
        success: true,
    };
};
