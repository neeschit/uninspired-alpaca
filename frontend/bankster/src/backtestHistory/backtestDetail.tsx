import { TableCell, TableRow, Grid } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React from "react";
import {
    BacktestPosition,
    BacktestResult,
    PositionDirection,
} from "../startBacktest/backtestModel";
import CustomPaginationActionsTable from "../table/table";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import clsx from "clsx";
import { Candlestick } from "../chart/candlestick";
import { formatISO, parse } from "date-fns";

const useStyles = makeStyles((theme) => ({
    selectedWatchlistRow: {
        backgroundColor: theme.palette.grey[600],
    },
    legend: {
        position: "relative",
        left: "12px",
        top: "12px",
        zIndex: 100,
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 300,
        color: "#FFFFFF",
    },
}));

export const BacktestDetail = ({ batch }: { batch: BacktestResult[] }) => {
    const date = batch[0].startDate;

    const theme = useTheme();

    const watchlist = batch[0].watchlist[date];
    const positions = batch[0].positions[date];

    const [symbolToGraph, setSymbolToGraph] = React.useState({
        symbol: "",
        entryTime: "",
        type: "",
    });
    const classes = useStyles();

    const chartRef = React.useRef<any>();

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
                    setSymbolToGraph({
                        symbol: row.id,
                        entryTime: formatISO(
                            parse(date, "yyyy-MM-dd", new Date(date))
                        ),
                        type: "watchlist",
                    });
                    setPosition(null);
                }}
                className={clsx(
                    symbolToGraph.symbol === row.id &&
                        symbolToGraph.type === "watchlist" &&
                        classes.selectedWatchlistRow
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

    const [
        selectedPosition,
        setPosition,
    ] = React.useState<BacktestPosition | null>(null);

    React.useEffect(() => {
        chartRef.current?.scrollIntoView();
    }, [symbolToGraph]);

    const getPositionRow = (row: typeof mappedPositions[0]) => {
        return (
            <TableRow
                key={row.symbol + row.entryTime}
                onClick={() => {
                    setSymbolToGraph({
                        symbol: row.symbol,
                        entryTime: row.entryTime,
                        type: "position",
                    });
                    setPosition(row);
                }}
                className={clsx(
                    symbolToGraph.symbol === row.symbol &&
                        symbolToGraph.type === "position" &&
                        symbolToGraph.entryTime === row.entryTime &&
                        classes.selectedWatchlistRow
                )}
                style={{ cursor: "pointer" }}
            >
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.side}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.totalPnl}</TableCell>
            </TableRow>
        );
    };

    return (
        <Grid container item>
            <Grid
                container
                item
                justifyContent="center"
                style={{ marginBottom: theme.spacing(2) }}
                spacing={4}
            >
                <Grid item>
                    Watchlist
                    <CustomPaginationActionsTable
                        rows={mappedWatchlist}
                        getRowElementForCurrentRow={getWatchlistRow}
                        showPagination={false}
                    ></CustomPaginationActionsTable>
                </Grid>
                <Grid item>
                    Trades Taken
                    <CustomPaginationActionsTable
                        rows={mappedPositions}
                        getRowElementForCurrentRow={getPositionRow}
                        showPagination={true}
                    ></CustomPaginationActionsTable>
                </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} ref={chartRef}>
                <Candlestick
                    symbolToGraph={symbolToGraph}
                    selectedPosition={selectedPosition}
                    addPlannedPricelinesForPosition={true}
                />
            </Grid>
        </Grid>
    );
};
