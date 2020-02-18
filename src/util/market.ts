import { isWeekend, set, isSameDay, isWithinInterval } from "date-fns";
import { TimestampType } from "../data/data.model";

const marketHolidays = [
    "02-17-2020",
    "04-10-2020",
    "05-25-2020",
    "07-03-2020",
    "09-03-2020",
    "11-26-2020",
    "12-25-2020"
];

export const isMarketOpen = (now: TimestampType = Date.now()) => {
    const marketOpenToday = set(now, {
        hours: 9,
        minutes: 30,
        seconds: 0
    });

    const marketCloseToday = set(now, {
        hours: 15,
        minutes: 59,
        seconds: 59
    });

    const isWeekday = !isWeekend(now);
    const isNotHoliday = !marketHolidays.some(day => isSameDay(now, new Date(day)));

    return (
        isWeekday &&
        isNotHoliday &&
        isWithinInterval(now, {
            start: marketOpenToday,
            end: marketCloseToday
        })
    );
};
