import { HttpFunction } from "@google-cloud/functions-framework/build/src/functions";
import { getSpyCompanies } from "@neeschit/core-data";
import { PubSub } from "@google-cloud/pubsub";

const spyCompanies = getSpyCompanies();

spyCompanies.push("SPY");

const pubSubClient = new PubSub();

export const cacheOrchestrator: HttpFunction = (req, res) => {
    const promises = spyCompanies.map((symbol) =>
        publishMessageForSymbol(symbol)
    );

    Promise.all(promises).then(() => {
        res.send();
    });
};

function publishMessageForSymbol(symbol: string): Promise<any> {
    const dataBuffer = Buffer.from(
        JSON.stringify({
            data: {
                symbol,
            },
        })
    );

    return publishMessage(dataBuffer);
}

async function publishMessage(dataBuffer: Buffer) {
    try {
        const messageId = await pubSubClient
            .topic("caching-request-channel")
            .publish(dataBuffer);
        console.log(`Message ${messageId} published as ${dataBuffer}`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}
