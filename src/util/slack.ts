import { TradePlan } from "../data/data.model";
import { postHttps } from "./post";

const slackHookOptions = {
    hostname: "hooks.slack.com",
    path: "/services/T4EKRGB54/B0138S9A3LY/VuZ8iHEDOw9mjzHKPI1HQLwD",
};

export const postEntry = async (symbol: string, timestamp: number, plan: TradePlan) => {
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
