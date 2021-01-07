import {
    TableCell,
    TableRow,
    Grid,
    Typography,
    IconButton,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React from "react";
import {
    BacktestPosition,
    BacktestResult,
} from "../startBacktest/backtestModel";
import CustomPaginationActionsTable from "../table/table";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeftOutlined";
import ChevronRightIcon from "@material-ui/icons/ChevronRightOutlined";
import clsx from "clsx";
import { Candlestick } from "../chart/candlestick";
import { formatISO, parse } from "date-fns";

const useStyles = makeStyles((theme) => ({
    selectedWatchlistRow: {
        backgroundColor: theme.palette.grey[600],
    },
}));

export const BacktestDetail = ({ batch }: { batch: BacktestResult }) => {
    const firstIndexWithSomething = batch.results.findIndex((b) => {
        return b.positions.length || b.watchlist.length;
    });
    const [currentIndex, setCurrentIndex] = React.useState(
        firstIndexWithSomething
    );

    const theme = useTheme();

    const watchlist = batch.results[currentIndex]?.watchlist || [];
    const positions = batch.results[currentIndex]?.positions || [];

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
                            parse(
                                batch.results[currentIndex].startDate,
                                "yyyy-MM-dd",
                                new Date(batch.results[currentIndex].startDate)
                            )
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

    const [
        selectedPosition,
        setPosition,
    ] = React.useState<BacktestPosition | null>(null);

    const getPositionRow = (row: BacktestPosition) => {
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
                <TableCell>{row.totalPnl.toFixed(2)}</TableCell>
                <TableCell>{row.entryTime}</TableCell>
                <TableCell>{row.exitTime}</TableCell>
            </TableRow>
        );
    };

    return (
        <Grid container item justifyContent="center">
            <Grid
                container
                item
                style={{ marginBottom: theme.spacing(2) }}
                justifyContent="space-around"
                alignItems="baseline"
                spacing={1}
            >
                <Grid item>
                    {batch.results.length > 1 ? (
                        <>
                            <IconButton
                                onClick={() => {
                                    setCurrentIndex(currentIndex - 1);
                                }}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography
                                component="p"
                                style={{
                                    display: "inline-block",
                                }}
                            >
                                Results date:{" "}
                                {batch.results[currentIndex].startDate}
                            </Typography>
                            <IconButton
                                onClick={() => {
                                    setCurrentIndex(currentIndex + 1);
                                }}
                                disabled={
                                    currentIndex === batch.results.length - 1
                                }
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    ) : (
                        ""
                    )}
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        Overall profit: {Math.round(batch.totalPnl)}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                            marginLeft: theme.spacing(1),
                            marginRight: theme.spacing(1),
                        }}
                    >
                        Max equity needed: {Math.round(batch.maxLeverage)}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        Risk per trade: $10
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        Profit ratio is 1:2
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        Strategy is {batch.strategy}
                    </Typography>
                </Grid>
            </Grid>
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
                        rows={positions}
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
