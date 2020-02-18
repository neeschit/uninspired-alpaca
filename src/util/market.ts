import { isWeekend, set, isSameDay, isWithinInterval } from "date-fns";
import { TimestampType, MarketTimezone } from "../data/data.model";
import { convertToTimeZone } from "date-fns-timezone";

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
    const marketOpenToday = convertToTimeZone(
        set(now, {
            hours: 9,
            minutes: 30,
            seconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

    const marketCloseToday = convertToTimeZone(
        set(now, {
            hours: 15,
            minutes: 59,
            seconds: 59
        }),
        {
            timeZone: MarketTimezone
        }
    );

    console.log(marketOpenToday);
    console.log(marketCloseToday);

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
