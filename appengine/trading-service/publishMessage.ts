import { PubSub } from "@google-cloud/pubsub";
import { Calendar } from "@neeschit/alpaca-trade-api";
import { BoomBarRequest } from "@neeschit/common-interfaces";

const pubSubClient = new PubSub();

export async function requestScreen(
    symbol: string,
    calendar: Calendar[]
): Promise<any> {
    const boomRequest: BoomBarRequest = {
        symbol,
        epoch: Date.now(),
        pubsubchannel: "trade-entry-channel",
        calendar,
    };
    const dataBuffer = Buffer.from(JSON.stringify(boomRequest));

    return publishMessage(dataBuffer);
}

async function publishMessage(dataBuffer: Buffer) {
    try {
        const messageId = await pubSubClient
            .topic("screening-request-channel")
            .publish(dataBuffer);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}
