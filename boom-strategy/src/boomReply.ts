import { BoomBarReply } from "@neeschit/common-interfaces";
import { RedisStrategy } from "@neeschit/redis";
import {
    getWatchlistCacheKey,
    getCachedBoomStats,
    getBoomRequestCacheKey,
} from "@neeschit/core-data";

export const handleBoomBarReply = async (
    data: BoomBarReply,
    redisApi: RedisStrategy
) => {
    const { symbol, epoch, isInPlay, relativeRange, relativeVolume, boomBar } =
        data;

    try {
        const key = getWatchlistCacheKey(epoch);
        if (isInPlay) {
            const size = await redisApi.promiseSadd(key, symbol);
            await redisApi.promiseSet(
                getCachedBoomStats(epoch, symbol),
                JSON.stringify({
                    relativeRange,
                    relativeVolume,
                    boomBar,
                })
            );
        }

        await redisApi.promiseIncr(getBoomRequestCacheKey(epoch));
    } catch (e) {
        console.error(e);
    }
};
