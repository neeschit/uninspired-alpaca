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
            });
        }

        return RedisApi.client;
    }
}

export const getRedisApi = () => {
    const redisClient = RedisApi.getInstance();

    const promiseGet = promisify(redisClient.get).bind(redisClient);
    const promiseSet = promisify(redisClient.set).bind(redisClient);
    const promiseLrange = promisify(redisClient.lrange).bind(redisClient);
    const promiseLpush: (key: string, value: string) => Promise<number> =
        promisify(redisClient.lpush).bind(redisClient);
    const promiseSadd: (key: string, value: string) => Promise<number> =
        promisify(redisClient.sadd).bind(redisClient);
    const promiseSmembers = promisify(redisClient.smembers).bind(redisClient);
    const promiseIncr = promisify(redisClient.incr).bind(redisClient);

    return {
        promiseGet,
        promiseSet,
        promiseLrange,
        promiseLpush,
        promiseSadd,
        promiseSmembers,
        promiseIncr,
        redisClient,
    };
};
