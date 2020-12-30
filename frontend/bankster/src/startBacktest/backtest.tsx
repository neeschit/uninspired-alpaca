import "date-fns";
import React from "react";
import {
    Grid,
    makeStyles,
    Button,
    CircularProgress,
    TextField,
} from "@material-ui/core";
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";
import { addBusinessDays, format } from "date-fns";
import { BacktestPosition } from "./backtestModel";
import { AppContext } from "../appContext";
import { TradesGrid } from "../tradeGrid/tradesGrid";

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
        marginTop: theme.spacing(10),
    },
}));

export const startBacktest = async (
    startDate: Date,
    endDate: Date
): Promise<BacktestPosition[]> => {
    const response = await fetch(
        `http://localhost:6971/backtest/${format(
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

    const [currentPositions, setPositions] = React.useState<BacktestPosition[]>(
        []
    );

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
                        disableFuture={true}
                        renderInput={(props) => <TextField {...props} />}
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
                        disableFuture={true}
                        value={selectedDates.endDate}
                        onChange={(date: Date | null) => {
                            setSelectedDate({
                                startDate: selectedDates.startDate,
                                endDate: date || selectedDates.endDate,
                            });
                        }}
                        renderInput={(props) => <TextField {...props} />}
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
                                    setPositions(positions);
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
                    justifyContent="center"
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
                    {!isLoading && (
                        <Grid item>
                            <TradesGrid
                                positions={currentPositions}
                            ></TradesGrid>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
};
