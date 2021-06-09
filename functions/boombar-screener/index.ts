import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { PubSub } from "@google-cloud/pubsub";
import { Calendar } from "@neeschit/alpaca-trade-api";

import { convertToLocalTime, getSpyCompanies } from "@neeschit/core-data";
import { isBoomBar } from "./screener";

const pubSubClient = new PubSub();

const spyCompanies = getSpyCompanies();

export const screenForBoombar: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: {
        data: {
            symbol: string;
            epoch: number;
            pubsubchannel: string;
            calendar: Calendar[];
        };
    } = JSON.parse(Buffer.from(dataBuffer, "base64").toString());

    if (!isTimeForBoomBarEntry(data.data.epoch)) {
        console.log("not the time to enter " + data.data.epoch);
        return;
    }

    if (spyCompanies.indexOf(data.data.symbol) === -1) {
        console.log(
            "not a company that is currently on the list " + data.data.symbol
        );
        return;
    }

    console.log(data.data);

    const screened = await isBoomBar(data.data);

    if (screened) {
        console.log("screened true for " + data.data.symbol);
        const dataBuffer = Buffer.from(
            JSON.stringify({
                data: {
                    symbol: data.data.symbol,
                    side: screened.side,
                    limitPrice: screened.limitPrice,
                    strategy: "boom",
                    epoch: data.data.epoch,
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
