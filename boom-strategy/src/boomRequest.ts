import { RedisStrategy } from "@neeschit/redis";
import { getBoomRequestCacheKey } from "@neeschit/core-data";

export const handleBoombarRequest = async (
    redisApi: RedisStrategy,
    requestCount: number,
    date: Date
) => {
    try {
        await redisApi.promiseSet(
            getBoomRequestCacheKey(date.getTime()),
            requestCount.toString()
        );
    } catch (e) {
        console.error(e);
    }
};
