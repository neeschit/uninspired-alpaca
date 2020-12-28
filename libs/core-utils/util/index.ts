import { existsSync, readdirSync, writeFileSync, appendFileSync } from "fs";
import FsExtra from "fs-extra";
const { ensureDirSync } = FsExtra;
import { DefaultDuration, PeriodType } from "../data/data.model";

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
