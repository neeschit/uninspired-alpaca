import "date-fns";
import React from "react";
import { Grid, makeStyles, Button, CircularProgress, TextField } from "@material-ui/core";
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";
import { addBusinessDays, format, isAfter } from "date-fns";
import { BacktestResult, backtestBaseUrl } from "./backtestModel";
import { AppContext } from "../appContext";
import { BacktestDetail } from "../backtestHistory/backtestDetail";

const useStyles = makeStyles((theme) => ({
    grid: {
        marginTop: theme.spacing(2),
    },
    alignMiddle: {
        display: "flex",
        alignItems: "center",
    },
    buttonProgress: {
        color: theme.palette.primary.light,
    },
    resultsContainer: {
        marginTop: theme.spacing(3),
    },
}));

export const startBacktest = async (startDate: Date, endDate: Date): Promise<BacktestResult> => {
    const response = await fetch(
        `${backtestBaseUrl}/backtest/${format(startDate, "yyyy-MM-dd")}/${format(
            endDate,
            "yyyy-MM-dd"
        )}`
    );

    const json = await response.json();

    return json;
};

export const BacktestStart = () => {
    const [selectedDates, setSelectedDate] = React.useState({
        startDate: addBusinessDays(new Date(), -1),
        endDate: addBusinessDays(new Date(), -1),
    });

    const { history, addToBacktestHistory } = React.useContext(AppContext);

    const classes = useStyles();

    const [isLoading, setLoading] = React.useState(false);

    const [results, setResults] = React.useState<BacktestResult | null>();

    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setHasError(isAfter(selectedDates.startDate, selectedDates.endDate));
    }, [selectedDates.startDate, selectedDates.endDate]);

    return (
        <LocalizationProvider dateAdapter={DateFnsUtils}>
            <Grid
                container
                className={classes.grid}
                justifyContent="space-evenly"
                alignItems="center"
                spacing={1}
            >
                <Grid item>
                    <DatePicker
                        label="Start Date"
                        value={selectedDates.startDate}
                        disableHighlightToday={true}
                        maxDate={addBusinessDays(Date.now(), -1)}
                        renderInput={(props) => <TextField {...props} error={hasError} />}
                        onChange={(date: Date | null) => {
                            setSelectedDate({
                                startDate: date || selectedDates.startDate,
                                endDate: selectedDates.endDate,
                            });
                        }}
                    />
                </Grid>
                <Grid item>
                    <DatePicker
                        label="End Date"
                        maxDate={addBusinessDays(Date.now(), -1)}
                        disableHighlightToday={true}
                        value={selectedDates.endDate}
                        onChange={(date: Date | null) => {
                            if (date) {
                                setSelectedDate({
                                    startDate: selectedDates.startDate,
                                    endDate: date,
                                });
                            }
                        }}
                        renderInput={(props) => <TextField {...props} error={hasError} />}
                    />
                </Grid>
                <Grid item>
                    <span className={classes.alignMiddle}>
                        <Button
                            disabled={hasError}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                setLoading(true);

                                const existingTest = history.find(
                                    (b) =>
                                        b.startDate ===
                                            format(selectedDates.startDate, "yyyy-MM-dd") &&
                                        b.endDate === format(selectedDates.endDate, "yyyy-MM-dd")
                                );

                                if (existingTest) {
                                    setResults(existingTest.results);
                                    setLoading(false);
                                    return;
                                }

                                startBacktest(selectedDates.startDate, selectedDates.endDate).then(
                                    (results) => {
                                        setLoading(false);
                                        setResults(results);
                                        addToBacktestHistory(
                                            format(selectedDates.startDate, "yyyy-MM-dd"),
                                            format(selectedDates.endDate, "yyyy-MM-dd"),
                                            results
                                        );
                                    }
                                );
                            }}
                        >
                            Run Test
                        </Button>
                    </span>
                </Grid>
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
                            <CircularProgress size={240} className={classes.buttonProgress} />)
                        </Grid>
                        )
                    </Grid>
                )}

                {!isLoading && (
                    <Grid container item className={classes.resultsContainer} direction="column">
                        {(results && results.results.length && (
                            <BacktestDetail batch={results}></BacktestDetail>
                        )) ||
                            ""}
                    </Grid>
                )}
            </Grid>
        </LocalizationProvider>
    );
};
