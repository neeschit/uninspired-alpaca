import React from "react";
import { BacktestPosition } from "../startBacktest/backtestModel";

export const TradesGrid = ({
    positions,
}: {
    positions: BacktestPosition[];
}) => {
    if (!positions.length) {
        return null;
    }
    return <div style={{ width: "100%", height: 600 }}>{positions.length}</div>;
};
