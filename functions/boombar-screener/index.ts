import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { PubSub } from "@google-cloud/pubsub";

import { convertToLocalTime } from "@neeschit/core-data";
import { isBoomBar } from "./screener";

const pubSubClient = new PubSub();

export const screenForBoombar: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: {
        data: { symbol: string; epoch: number; pubsubchannel: string };
    } = JSON.parse(Buffer.from(dataBuffer, "base64").toString());

    if (!isTimeForBoomBarEntry(data.data.epoch)) {
        return;
    }

    const screenedSide = isBoomBar(data.data);

    if (screenedSide) {
        const dataBuffer = Buffer.from(
            JSON.stringify({
                data: {
                    symbol: data.data.symbol,
                    side: screenedSide,
                },
            })
        );
        await publishMessage(dataBuffer, data.data.pubsubchannel);
    }
};

async function publishMessage(dataBuffer: Buffer, channel: string) {
    try {
        const messageId = await pubSubClient.topic(channel).publish(dataBuffer);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}

const isTimeForBoomBarEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:34:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:35:25.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};
