import { readFileSync } from "fs";

export const getHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./largeCapsHighVolume.json").toString());
};

export const getLargeCaps = (): string[] => {
    return JSON.parse(readFileSync("./largecaps.json").toString());
};

export const getMegaCaps = (): string[] => {
    return JSON.parse(readFileSync("./megacaps.json").toString());
};

export const getFilteredHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./filteredLargeCapsHighVolume.json").toString());
};
