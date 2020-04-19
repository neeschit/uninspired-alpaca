import { readFileSync } from "fs";

export const getHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./largeCapsHighVolume.json").toString());
};

export const getFilteredHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./filteredLargeCapsHighVolume.json").toString());
};
