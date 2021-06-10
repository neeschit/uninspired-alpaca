import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { PubSub } from "@google-cloud/pubsub";

import { isTimeForBoomBarEntry, getSpyCompanies } from "@neeschit/core-data";
import { BoomBarReply, BoomBarRequest } from "@neeschit/common-interfaces";
import { isBoomBar } from "./screener";

const pubSubClient = new PubSub();

const spyCompanies = getSpyCompanies();

export const screenForBoombar: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: BoomBarRequest = JSON.parse(
        Buffer.from(dataBuffer, "base64").toString()
    );

    if (!isTimeForBoomBarEntry(data.epoch)) {
        console.log("not the time to enter " + data.epoch);
        return;
    }

    if (spyCompanies.indexOf(data.symbol) === -1) {
        console.log(
            "not a company that is currently on the list " + data.symbol
        );
        return;
    }

    console.log(data);

    const screened = await isBoomBar(data);

    if (screened) {
        console.log("screened true for " + data.symbol);
    }

    const replyMessage: BoomBarReply = {
        symbol: data.symbol,
        side: screened?.side,
        limitPrice: screened?.limitPrice,
        isInPlay: !!screened,
        strategy: "boom",
        epoch: data.epoch,
    };

    const messagedBuffer = Buffer.from(JSON.stringify(replyMessage));
    await publishMessage(messagedBuffer, data.pubsubchannel);
};

async function publishMessage(dataBuffer: Buffer, channel: string) {
    try {
        const messageId = await pubSubClient.topic(channel).publish(dataBuffer);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}
