import { DefaultDuration, PeriodType, Bar } from "../data/data.model";
import { differenceInBusinessDays, addDays } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { existsSync, readdirSync, writeFileSync, appendFileSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { isMarketHoliday } from "./market";
import { currentTradingSymbols } from "../data/filters";

export * from "./get";

export function roundHalf(num: number) {
    return Math.round(num * 2) / 2;
}

export function floorHalf(num: number) {
    return Math.floor(num * 2) / 2;
}

export function ceilHalf(num: number) {
    return Math.ceil(num * 2) / 2;
}
const cacheDirectory = "./data/cache";

export const getCacheDataName = (
    symbol: string,
    duration: DefaultDuration,
    period: PeriodType,
    startDate?: Date,
    endDate?: Date
) => {
    const directory = `${cacheDirectory}/${symbol}/${duration}/${period}/`;
    ensureDirSync(directory);

    if (startDate && endDate) {
        return `${directory}${startDate.toISOString()}-${endDate.toISOString()}.json`;
    }

    return `${directory}${readdirSync(directory)[0]}`;
};

export const verifyBarData = (bars: Bar[]) => {
    for (let i = 1; i < bars.length; i++) {
        const diff = differenceInBusinessDays(bars[i].t, bars[i - 1].t);

        if (diff !== 1) {
            const prevDay = addDays(bars[i - 1].t, 1);
            const nextDay = addDays(bars[i].t, -1);
            const isPreviousDayHoliday = isMarketHoliday(prevDay);
            const isNextDayHoliday = isMarketHoliday(nextDay);
            const isHoliday = isPreviousDayHoliday || isNextDayHoliday;

            if (!isHoliday) {
                LOGGER.warn(
                    `Expected diff of 1 - got ${diff} for ${new Date(
                        bars[i].t
                    )} for 
                        ${new Date(bars[i - 1].t)}`
                );
                return false;
            }
        }
    }

    return true;
};

export const appendToCollectionFile = (filename: string, data: any[]) => {
    if (!data || !data.length) {
        return;
    }
    if (!existsSync(filename)) {
        writeFileSync(filename, "[");
    } else {
        appendFileSync(filename, ",");
    }
    appendFileSync(filename, JSON.stringify(data).slice(1, -1));
};
