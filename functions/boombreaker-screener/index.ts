import { EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { BoomBarRequest } from "@neeschit/common-interfaces";
import {
    isTimeForBoomBarEntry,
    getSpyCompanies,
    isTimeForBoomBreakoutEntry,
} from "@neeschit/core-data";

export const boomBreaker: EventFunction = async (
    message: any,
    context: any
) => {
    const dataBuffer = message?.data || context?.message?.data;

    const data: BoomBarRequest = JSON.parse(
        Buffer.from(dataBuffer, "base64").toString()
    );

    if (getSpyCompanies().indexOf(data.symbol) === -1) {
        console.log(
            "not a company that is currently on the list for boom breakout " +
                data.symbol
        );
        return;
    }

    if (
        !isTimeForBoomBarEntry(data.epoch) ||
        !isTimeForBoomBreakoutEntry(data.epoch)
    ) {
        console.log(
            "not the time to to screen for breakout or enter " + data.epoch
        );
        return;
    }
};
