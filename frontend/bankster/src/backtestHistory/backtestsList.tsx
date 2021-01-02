import { Grid, TableCell, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { AppContext, BacktestHistory } from "../appContext";
import { BacktestResult } from "../startBacktest/backtestModel";
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

export const BacktestsList = () => {
    const { history } = React.useContext(AppContext);

    const [currentBacktest, setSelectedBacktest] = React.useState<
        BacktestResult[] | null
    >(null);

    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const classes = useStyles();

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
