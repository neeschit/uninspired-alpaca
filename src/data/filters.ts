import { readFileSync } from "fs";

export const getHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./largeCapsHighVolume.json").toString());
};
