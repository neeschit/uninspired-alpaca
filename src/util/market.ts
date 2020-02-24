import { isWeekend, set, isSameDay } from "date-fns";
import { TimestampType, MarketTimezone } from "../data/data.model";
import { convertToLocalTime } from "date-fns-timezone";

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
    const marketOpenToday = convertToLocalTime(
        set(now, {
            hours: 9,
            minutes: 30,
            seconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

    const marketCloseToday = convertToLocalTime(
        set(now, {
            hours: 15,
            minutes: 59,
            seconds: 59
        }),
        {
            timeZone: MarketTimezone
        }
    );

    const isWeekday = !isWeekend(now);
    const isNotHoliday = !marketHolidays.some(day => isSameDay(now, new Date(day)));
    const nowMillis = now instanceof Date ? now.getTime() : now;

    return (
        isWeekday &&
        isNotHoliday &&
        marketOpenToday.getTime() <= nowMillis &&
        marketCloseToday.getTime() >= nowMillis
    );
};
