import React from "react";
import { BacktestModel, BacktestPosition } from "./startBacktest/backtestModel";

export const AppContext = React.createContext<{
    drawerOpen: boolean;
    setDrawerOpen: (val: boolean) => void;
    history: BacktestModel[];
    addToBacktestHistory: (
        startDate: Date,
        endDate: Date,
        positions: BacktestPosition[]
    ) => void;
}>({
    drawerOpen: false,
    setDrawerOpen: (val: boolean) => {},
    history: [],
    addToBacktestHistory: (
        startDate: Date,
        endDate: Date,
        positions: BacktestPosition[]
    ) => {},
});
