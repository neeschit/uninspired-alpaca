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

export interface BacktestWatchlist {
    [index: string]: string[];
}

export interface BacktestPositions {
    [index: string]: BacktestPosition[];
}

export interface BacktestResult {
    watchlist: BacktestWatchlist;
    positions: BacktestPositions;
    startDate: string;
    endDate: string;
}

export interface Bar {
    open: number;
    high: number;
    low: number;
    close: number;
    time: any;
    volume: number;
}
