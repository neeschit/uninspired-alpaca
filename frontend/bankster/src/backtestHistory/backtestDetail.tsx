import { Grid } from "@material-ui/core";
import React from "react";
import { BacktestResult } from "../startBacktest/backtestModel";

export const BacktestDetail = ({ batch }: { batch: BacktestResult[] }) => {
    console.log(batch);
    console.log(batch.length);
    if (!batch.length) {
        return null;
    }

    const message = `Backtest ran from ${batch[0].startDate} to ${
        batch[batch.length - 1].endDate
    }`;

    console.log(message);

    return (
        <>
            <Grid item></Grid>
        </>
    );
};
