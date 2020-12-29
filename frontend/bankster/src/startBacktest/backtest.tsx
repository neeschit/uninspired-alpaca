import "date-fns";
import React from "react";
import { Grid, makeStyles, Button } from "@material-ui/core";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const useStyles = makeStyles({
    grid: {
        width: "60%",
    },
    alignMiddle: {
        display: "flex",
        alignItems: "center",
    },
});

export const BacktestStart = () => {
    const [selectedDates, setSelectedDate] = React.useState({
        startDate: new Date(),
        endDate: new Date(),
    });

    const classes = useStyles();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container className={classes.grid} justify="space-around">
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

                <span className={classes.alignMiddle}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {}}
                    >
                        Run Test
                    </Button>
                </span>
            </Grid>
        </MuiPickersUtilsProvider>
    );
};
