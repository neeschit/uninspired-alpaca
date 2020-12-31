import { TableCell, TableRow } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React from "react";
import {
    BacktestResult,
    PositionDirection,
} from "../startBacktest/backtestModel";
import CustomPaginationActionsTable from "../table/table";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
    selectedRow: {
        backgroundColor: theme.palette.grey[600],
    },
}));

export const BacktestDetail = ({ batch }: { batch: BacktestResult[] }) => {
    const date = batch[0].startDate;
    const theme = useTheme();

    const watchlist = batch[0].watchlist[date];
    const positions = batch[0].positions[date];

    const [symbolToGraph, setSymbolToGraph] = React.useState("");
    const classes = useStyles();

    const mappedWatchlist = watchlist.map((symbol) => {
        const isInPositions = positions.some((p) => p.symbol === symbol);
        return {
            symbol,
            id: symbol,
            wasEntered: isInPositions,
        };
    });

    const getWatchlistRow = (row: typeof mappedWatchlist[0]) => {
        return (
            <TableRow
                key={row.id}
                onClick={() => {
                    setSymbolToGraph(row.id);
                }}
                className={clsx(
                    symbolToGraph === row.id && classes.selectedRow
                )}
                style={{ cursor: "pointer" }}
            >
                <TableCell>{row.symbol}</TableCell>
                <TableCell>
                    {row.wasEntered ? <CheckCircleIcon /> : <CancelIcon />}
                </TableCell>
            </TableRow>
        );
    };

    const mappedPositions = positions.map((p) => {
        const pnl =
            p.side === PositionDirection.long
                ? p.averageExitPrice - p.averageEntryPrice
                : p.averageEntryPrice - p.averageExitPrice;

        const totalPnl = pnl * p.qty;

        return {
            ...p,
            totalPnl,
        };
    });

    const getPositionRow = (row: typeof mappedPositions[0]) => {
        return (
            <TableRow
                key={row.symbol + row.entryTime}
                onClick={() => {
                    setSymbolToGraph(row.symbol + row.entryTime);
                }}
                className={clsx(
                    symbolToGraph === row.symbol + row.entryTime &&
                        classes.selectedRow
                )}
                style={{ cursor: "pointer" }}
            >
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.side}</TableCell>
                <TableCell>{row.totalPnl}</TableCell>
            </TableRow>
        );
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-around",
            }}
        >
            <div>
                <div>
                    Watchlist
                    <CustomPaginationActionsTable
                        rows={mappedWatchlist}
                        getRowElementForCurrentRow={getWatchlistRow}
                        showPagination={false}
                    ></CustomPaginationActionsTable>
                </div>
                <div style={{ marginTop: theme.spacing(2) }}>
                    Trades Taken
                    <CustomPaginationActionsTable
                        rows={mappedPositions}
                        getRowElementForCurrentRow={getPositionRow}
                        showPagination={true}
                    ></CustomPaginationActionsTable>
                </div>
            </div>
            <div>
                <div>Hello</div>
            </div>
        </div>
    );
};
