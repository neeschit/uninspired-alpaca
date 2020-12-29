import React from "react";
import { AppContext } from "../appContext";

export const BacktestsList = () => {
    const { history } = React.useContext(AppContext);

    const message =
        !history || !history.length
            ? "Run a backtest first"
            : "Under construction";

    return <div>{message}</div>;
};
