import "date-fns";
import React from "react";
import { Grid, makeStyles, Button, CircularProgress } from "@material-ui/core";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { addBusinessDays, format } from "date-fns";
import { BacktestPosition } from "./backtestModel";
import { AppContext } from "../appContext";

const useStyles = makeStyles((theme) => ({
    grid: {
        margin: "0 auto",
    },
    alignMiddle: {
        display: "flex",
        alignItems: "center",
    },
    buttonProgress: {
        color: theme.palette.primary.light,
    },
    resultsContainer: {
        marginTop: theme.spacing(10),
    },
}));

export const startBacktest = async (
    startDate: Date,
    endDate: Date
): Promise<BacktestPosition[]> => {
    const response = await fetch(
        `http://localhost:6972/backtest/${format(
            startDate,
            "yyyy-MM-dd"
        )}/${format(endDate, "yyyy-MM-dd")}`
    );

    return response.json();
};

export const BacktestStart = () => {
    const [selectedDates, setSelectedDate] = React.useState({
        startDate: addBusinessDays(new Date(), -1),
        endDate: addBusinessDays(new Date(), -1),
    });

    const { addToBacktestHistory } = React.useContext(AppContext);

    const classes = useStyles();

    const [isLoading, setLoading] = React.useState(false);

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid
                container
                className={classes.grid}
                justify="space-around"
                alignItems="center"
                spacing={1}
            >
                <Grid item>
                    <KeyboardDatePicker
                        margin="normal"
                        id="mui-pickers-date"
                        label="Start Date"
                        value={selectedDates.startDate}
                        onChange={(date: Date | null) => {
                            setSelectedDate({
                                startDate: date || selectedDates.startDate,
                                endDate: selectedDates.endDate,
                            });
                        }}
                        KeyboardButtonProps={{
                            "aria-label": "change start date",
                        }}
                    />
                </Grid>
                <Grid item>
                    <KeyboardDatePicker
                        margin="normal"
                        id="mui-pickers-date"
                        label="End Date"
                        value={selectedDates.endDate}
                        onChange={(date: Date | null) => {
                            setSelectedDate({
                                startDate: selectedDates.startDate,
                                endDate: date || selectedDates.endDate,
                            });
                        }}
                        KeyboardButtonProps={{
                            "aria-label": "change start date",
                        }}
                    />
                </Grid>
                <Grid item>
                    <span className={classes.alignMiddle}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                setLoading(true);

                                startBacktest(
                                    selectedDates.startDate,
                                    selectedDates.endDate
                                ).then((positions) => {
                                    setLoading(false);
                                    console.log(positions);
                                    addToBacktestHistory(
                                        selectedDates.startDate,
                                        selectedDates.endDate,
                                        positions
                                    );
                                });
                            }}
                        >
                            Run Test
                        </Button>
                    </span>
                </Grid>
                <Grid
                    container
                    xs={12}
                    alignItems="center"
                    justify="center"
                    className={classes.resultsContainer}
                >
                    <Grid item>
                        {isLoading && (
                            <CircularProgress
                                size={240}
                                className={classes.buttonProgress}
                            />
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </MuiPickersUtilsProvider>
    );
};
