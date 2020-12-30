import React from "react";
import { BacktestResult } from "./startBacktest/backtestModel";

export const AppContext = React.createContext<{
    drawerOpen: boolean;
    setDrawerOpen: (val: boolean) => void;
    history: BacktestResult[][];
    addToBacktestHistory: (results: BacktestResult[]) => void;
}>({
    drawerOpen: false,
    setDrawerOpen: (val: boolean) => {},
    history: [],
    addToBacktestHistory: (positions: BacktestResult[]) => {},
});
