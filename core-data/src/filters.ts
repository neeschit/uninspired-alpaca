import { readFileSync } from "fs";

export const getLargeCaps = (): string[] => {
    return JSON.parse(
        readFileSync(__dirname + "/../largecaps.json").toString()
    );
};

export const getMegaCaps = (): string[] => {
    return JSON.parse(
        readFileSync(__dirname + "/../megacaps-new.json").toString()
    );
};

export const getUnfilteredMegaCaps = (): string[] => {
    return JSON.parse(readFileSync(__dirname + "/../megacaps.json").toString());
};

export const getFilteredHighVolumeCompanies = (): string[] => {
    return JSON.parse(
        readFileSync(
            __dirname + "/../filteredLargeCapsHighVolume.json"
        ).toString()
    );
};

export const currentTradingSymbols = getMegaCaps();

export const currentIndices = ["SPY"];

export const currentStreamingSymbols = [
    ...currentTradingSymbols,
    ...currentIndices,
];
