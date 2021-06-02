import * as redis from "redis";
import { promisify } from "util";

class RedisApi {
    private static client: redis.RedisClient;
    private constructor() {}

    static getInstance() {
        if (!RedisApi.client) {
            RedisApi.client = redis.createClient({
                host: "redis-18495.c9.us-east-1-2.ec2.cloud.redislabs.com",
                port: 18495,
                password: process.env.REDIS_KEY!,
                disable_resubscribing: true,
            });
        }

        return RedisApi.client;
    }
}

export const getRedisApi = () => {
    const redisClient = RedisApi.getInstance();

    const promiseGet = promisify(redisClient.get).bind(redisClient);
    const promiseSet = promisify(redisClient.set).bind(redisClient);

    return {
        promiseGet,
        promiseSet,
    };
};
