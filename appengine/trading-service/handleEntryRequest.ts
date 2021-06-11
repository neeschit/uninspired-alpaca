import {
    Alpaca,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { getRedisApi } from "@neeschit/redis";
import { getEntryCacheKey, alpaca } from "./alpaca";

const entryList: { [index: string]: boolean } = {};

export async function handleEntryRequest({
    symbol,
    epoch,
    side,
    limitPrice,
    client,
}: {
    symbol: string;
    epoch: number;
    client: Alpaca;
    side: TradeDirection;
    limitPrice: number;
}) {
    const { promiseGet: redisGet, promiseSet: redisSet } = getRedisApi();

    if (entryList[symbol]) {
        return;
    }
    entryList[symbol] = true;

    const cacheKey = getEntryCacheKey(symbol, epoch);

    const isEntering = await redisGet(cacheKey);

    if (isEntering === "true") {
        console.log("returning due to entered symbol " + symbol);
        return;
    }

    redisSet(cacheKey, "true");

    const quantity = await getRiskAdjustedQuantity({ symbol });

    if (quantity < 1) {
        console.log("not entering " + symbol + " at " + Date.now());
        redisSet(cacheKey, "false");
        entryList[symbol] = false;
        return;
    }

    await client.createOrder({
        qty: quantity,
        symbol,
        side,
        type: TradeType.market,
        time_in_force: TimeInForce.day,
        extended_hours: false,
        order_class: "simple",
    });

    entryList[symbol] = false;
}

export const getRiskAdjustedQuantity = async ({
    symbol,
}: {
    symbol: string;
}) => {
    const snapshot = await alpaca.getSnapshot(symbol, alpaca.configuration);

    const lastPrice = snapshot.latestTrade.p;

    const spread = Math.abs(snapshot.latestQuote.ap - snapshot.latestQuote.bp);

    if (spread > 1) {
        return 0;
    }

    if (spread > 0.5) {
        if (lastPrice > 300) {
            return 25;
        } else {
            return 0;
        }
    }

    if (spread > 0.25) {
        if (lastPrice > 300) {
            return 50;
        } else if (lastPrice > 150) {
            return 100;
        } else {
            return 0;
        }
    }

    if (spread > 0.05) {
        if (lastPrice > 150) {
            return 100;
        } else if (lastPrice > 100) {
            return 150;
        } else if (lastPrice > 50) {
            return 300;
        } else {
            return 300;
        }
    }
    const quantity = Math.floor(20000 / lastPrice);

    if (spread < 0.03) {
        if (lastPrice > 150) {
            return 200;
        } else if (lastPrice > 100) {
            return 300;
        } else if (lastPrice > 50) {
            return 500;
        } else {
            return quantity;
        }
    }

    return quantity;
};
