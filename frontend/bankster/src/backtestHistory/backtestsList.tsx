import { CircularProgress, Grid, TableCell, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { AppContext, BacktestHistory } from "../appContext";
import {
    backtestBaseUrl,
    BacktestResult,
} from "../startBacktest/backtestModel";
import CustomPaginationActionsTable from "../table/table";
import { BacktestDetail } from "./backtestDetail";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
    selectedRow: {
        backgroundColor: theme.palette.grey[600],
    },
    backtestListContainer: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(1),
    },
    resultsContainer: {
        marginTop: theme.spacing(3),
    },
    buttonProgress: {
        color: theme.palette.primary.light,
    },
}));

export const getCachedBacktests = async (): Promise<BacktestResult[]> => {
    const response = await fetch(`${backtestBaseUrl}/cached`);

    const json = await response.json();

    return json;
};

export const BacktestsList = () => {
    const { history, addToBacktestHistory } = React.useContext(AppContext);

    const [isLoading, setLoading] = React.useState(!!history.length || false);

    const [
        currentBacktest,
        setSelectedBacktest,
    ] = React.useState<BacktestResult | null>(null);

    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const classes = useStyles();

    React.useEffect(() => {
        if (history.length !== 0) {
            return;
        }

        setLoading(true);
        getCachedBacktests().then((results) => {
            for (const result of results) {
                addToBacktestHistory(
                    result.results[0].startDate,
                    result.results[result.results.length - 1].endDate,
                    result
                );
            }

            setSelectedBacktest(results[0]);
            setSelectedIndex(0);
            setLoading(false);
        });
    }, [addToBacktestHistory]); // eslint-disable-line react-hooks/exhaustive-deps

    const getRowElementForCurrentRow = (
        row: BacktestHistory,
        index: number
    ) => {
        return (
            <TableRow
                key={row.startDate + "-" + row.endDate}
                onClick={() => {
                    setSelectedBacktest(row.results);
                    setSelectedIndex(index);
                }}
                className={clsx(selectedIndex === index && classes.selectedRow)}
                style={{ cursor: "pointer" }}
            >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.endDate}</TableCell>
            </TableRow>
        );
    };

    return (
        <>
            {isLoading && (
                <Grid
                    container
                    item
                    alignItems="center"
                    justifyContent="space-around"
                    className={classes.resultsContainer}
                >
                    (
                    <Grid item>
                        (
                        <CircularProgress
                            size={240}
                            className={classes.buttonProgress}
                        />
                        )
                    </Grid>
                    )
                </Grid>
            )}
            {!isLoading && (
                <Grid container justifyContent="center">
                    <Grid item className={classes.backtestListContainer}>
                        <CustomPaginationActionsTable
                            rows={history}
                            getRowElementForCurrentRow={
                                getRowElementForCurrentRow
                            }
                            showPagination={false}
                        ></CustomPaginationActionsTable>
                    </Grid>
                    {currentBacktest && (
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <BacktestDetail
                                batch={currentBacktest}
                            ></BacktestDetail>
                        </Grid>
                    )}
                </Grid>
            )}
        </>
    );
};
