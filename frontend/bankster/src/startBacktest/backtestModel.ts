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
