import { setupServer } from "./setupApiServer";
import * as redis from "redis";
import { promisify } from "util";
import { setupAlpacaStreams, alpaca } from "./alpaca";

export const redisClient = redis.createClient({
    host: "redis-18495.c9.us-east-1-2.ec2.cloud.redislabs.com",
    port: 18495,
    password: process.env.REDIS_KEY!,
    disable_resubscribing: true,
});

const promiseGet = promisify(redisClient.get).bind(redisClient);
const promiseSet = promisify(redisClient.set).bind(redisClient);

setupAlpacaStreams(promiseSet).then(() => {
    console.log("setup alpaca streams");
});

const server = setupServer(promiseGet, promiseSet, alpaca);

module.exports = server;
