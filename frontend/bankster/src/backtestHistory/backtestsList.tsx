import { Grid, TableCell, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { AppContext, BacktestHistory } from "../appContext";
import { backtestBaseUrl, BacktestResult } from "../startBacktest/backtestModel";
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
}));

export const getCachedBacktests = async (): Promise<BacktestResult[]> => {
    const response = await fetch(`${backtestBaseUrl}/cached`);

    const json = await response.json();

    return json;
};

export const BacktestsList = () => {
    const { history, addToBacktestHistory } = React.useContext(AppContext);

    const [currentBacktest, setSelectedBacktest] = React.useState<BacktestResult | null>(null);

    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const classes = useStyles();

    React.useEffect(() => {
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
        });
    }, [addToBacktestHistory]);

    const getRowElementForCurrentRow = (row: BacktestHistory, index: number) => {
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
        <Grid container justifyContent="center">
            <Grid item className={classes.backtestListContainer}>
                <CustomPaginationActionsTable
                    rows={history}
                    getRowElementForCurrentRow={getRowElementForCurrentRow}
                    showPagination={false}
                ></CustomPaginationActionsTable>
            </Grid>
            {currentBacktest && (
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <BacktestDetail batch={currentBacktest}></BacktestDetail>
                </Grid>
            )}
        </Grid>
    );
};
