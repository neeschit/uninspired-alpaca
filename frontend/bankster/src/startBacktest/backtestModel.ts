export const backtestBaseUrl = "https://6841deaec3ec.ngrok.io";

export enum PositionDirection {
    long = "long",
    short = "short",
}

export interface BacktestPosition {
    averageExitPrice: number;
    averageEntryPrice: number;
    plannedEntryPrice: number;
    plannedExitPrice: number;
    plannedTargetPrice: number;
    totalPnl: number;
    qty: number;
    side: PositionDirection;
    symbol: string;
    entryTime: string;
    exitTime: string;
    orderIds: {
        open: string;
        close: string;
    };
}

export interface BacktestResult {
    results: {
        watchlist: string[];
        positions: BacktestPosition[];
        startDate: string;
        endDate: string;
    }[];
    totalPnl: number;
    maxLeverage: number;
    strategy: string;
}

export interface Bar {
    open: number;
    high: number;
    low: number;
    close: number;
    time: any;
    volume: number;
}

export const pathMap: { [index: string]: string } = {
    "Model 1": "nrb",
    "Model 2": "spyGap",
};
