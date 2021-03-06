import { AlpacaOrder } from "@neeschit/alpaca-trade-api";
import { postHttps } from "./post";

const slackHookOptions = {
    hostname: "hooks.slack.com",
    path: "/services/T4EKRGB54/B0138S9A3LY/VuZ8iHEDOw9mjzHKPI1HQLwD",
};

export const postEntry = async (
    symbol: string,
    timestamp: number,
    plan: any
) => {
    const text = `Looking like a good entry for ${symbol} at ${new Date(
        timestamp
    ).toISOString()} with plan = ${JSON.stringify(plan)}`;

    return postHttps({
        ...slackHookOptions,
        data: {
            text,
        },
    });
};

export const postPartial = async (order: AlpacaOrder) => {
    const text = `Placing exit order for ${order.symbol} at ${new Date(
        Date.now()
    ).toISOString()} with order = ${JSON.stringify(order)}`;

    return postHttps({
        ...slackHookOptions,
        data: {
            text,
        },
    });
};

export const postErrorReplacing = async (order: AlpacaOrder) => {
    const text = `Error replacing order ${order.symbol} at ${new Date(
        Date.now()
    ).toISOString()} with order = ${JSON.stringify(order)}`;

    return postHttps({
        ...slackHookOptions,
        data: {
            text,
        },
    });
};
