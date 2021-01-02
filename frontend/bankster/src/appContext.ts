import React from "react";
import { BacktestResult } from "./startBacktest/backtestModel";

export interface BacktestHistory {
    startDate: string;
    endDate: string;
    results: BacktestResult[];
}

export const AppContext = React.createContext<{
    drawerOpen: boolean;
    setDrawerOpen: (val: boolean) => void;
    history: BacktestHistory[];
    addToBacktestHistory: (
        startDate: string,
        endDate: string,
        results: BacktestResult[]
    ) => void;
}>({
    drawerOpen: false,
    setDrawerOpen: (val: boolean) => {},
    history: [],
    addToBacktestHistory: (
        startDate: string,
        endDate: string,
        positions: BacktestResult[]
    ) => {},
});
