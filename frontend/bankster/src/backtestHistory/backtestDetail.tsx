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
import { addBusinessDays, format, formatISO, parse } from "date-fns";
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";
import { TextField } from "@material-ui/core";

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

    const dates = batch.results.map((r) => r.startDate);

    React.useEffect(() => {
        setCurrentIndex(0);
    }, [batch]);

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

    React.useEffect(() => {}, []);

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
                            <LocalizationProvider dateAdapter={DateFnsUtils}>
                                <DatePicker
                                    label="Results Date"
                                    value={parse(
                                        batch.results[currentIndex]?.startDate,
                                        "yyyy-MM-dd",
                                        addBusinessDays(
                                            new Date(
                                                batch.results[
                                                    currentIndex
                                                ]?.startDate
                                            ),
                                            1
                                        )
                                    )}
                                    renderInput={(props) => (
                                        <TextField {...props} />
                                    )}
                                    shouldDisableDate={(day: any) => {
                                        const date = format(day, "yyyy-MM-dd");

                                        return dates.indexOf(date) === -1;
                                    }}
                                    minDate={dates[0]}
                                    maxDate={
                                        dates.length && dates[dates.length - 1]
                                    }
                                    onChange={(date: Date | null) => {
                                        if (!date) {
                                            return;
                                        }
                                        const formattedDate = format(
                                            date,
                                            "yyyy-MM-dd"
                                        );

                                        const index = dates.indexOf(
                                            formattedDate
                                        );

                                        setCurrentIndex(index);
                                    }}
                                />
                            </LocalizationProvider>
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
                        Max equity needed:{" "}
                        {Math.max(25000, Math.round(batch.maxLeverage / 4))} on{" "}
                        {parse(
                            batch.maxLeverageDate,
                            "yyyy-MM-dd",
                            addBusinessDays(new Date(batch.maxLeverageDate), 1)
                        ).toLocaleDateString()}
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
                        Max drawdown: {Math.round(batch.maxDrawdown)} on{" "}
                        {parse(
                            batch.maxDrawdownDate,
                            "yyyy-MM-dd",
                            addBusinessDays(new Date(batch.maxDrawdownDate), 1)
                        ).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        Leverage for today:{" "}
                        {batch.results[currentIndex]?.maxLeverage}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        component="p"
                        style={{
                            display: "inline-block",
                        }}
                    >
                        PnL for today: {batch.results[currentIndex]?.pnl}
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
