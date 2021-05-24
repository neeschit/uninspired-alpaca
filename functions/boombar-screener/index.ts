import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { isBoomBar } from "./screener";

export const screenForBoombar: EventFunction = async (
    message: any,
    context: any
) => {
    console.log(message);
    console.log(context);
    const dataBuffer = message?.data || context?.message?.data;

    const data: { data: { symbol: string; epoch: number } } = JSON.parse(
        Buffer.from(dataBuffer, "base64").toString()
    );

    const screened = isBoomBar(data.data);
};
