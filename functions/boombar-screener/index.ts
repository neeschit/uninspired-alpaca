import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";

export const screenForBoombar: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: { data: { symbol: string; epoch: number } } = JSON.parse(
        Buffer.from(dataBuffer, "base64").toString()
    );

    const screened = isBoomBar(data.data);
};

export const isBoomBar = ({
    symbol,
    epoch,
}: {
    symbol: string;
    epoch: number;
}) => {};
