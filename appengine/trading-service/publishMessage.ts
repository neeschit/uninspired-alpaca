import { PubSub } from "@google-cloud/pubsub";

const pubSubClient = new PubSub();

export async function requestScreen(symbol: string): Promise<any> {
    const dataBuffer = Buffer.from(
        JSON.stringify({
            data: {
                symbol,
                epoch: Date.now(),
            },
        })
    );

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
