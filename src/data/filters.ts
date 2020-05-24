import { readFileSync } from "fs";

export const getLargeCaps = (): string[] => {
    return JSON.parse(readFileSync("./largecaps.json").toString());
};

export const getMegaCaps = (): string[] => {
    return JSON.parse(readFileSync("./megacaps-filtered.json").toString());
};

export const getUnfilteredMegaCaps = (): string[] => {
    return JSON.parse(readFileSync("./megacaps.json").toString());
};

export const getFilteredHighVolumeCompanies = (): string[] => {
    return JSON.parse(readFileSync("./filteredLargeCapsHighVolume.json").toString());
};

export const currentTradingSymbols = getMegaCaps();

export const currentIndices = ["SPY"];

export const currentStreamingSymbols = [...currentTradingSymbols, ...currentIndices];
