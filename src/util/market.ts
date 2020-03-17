import { isWeekend, set, isSameDay, isAfter, isBefore, isEqual } from "date-fns";
import { TimestampType, MarketTimezone } from "../data/data.model";
import { convertToLocalTime } from "./date";

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
    const isWeekday = !isWeekend(now);
    const isNotHoliday = !marketHolidays.some(day => isSameDay(now, new Date(day)));

    return isWeekday && isNotHoliday && isAfterMarketOpen(now) && isBeforeMarketClose(now);
};

export const isAfterMarketOpen = (now: TimestampType) => {
    const marketOpenTime = getMarketOpenMillis(now);
    const isAfterMarketOpen =
        (isAfter(now, marketOpenTime) || isEqual(now, marketOpenTime)) &&
        isSameDay(marketOpenTime, now);

    return isAfterMarketOpen;
};

export const isAfterMarketClose = (now: TimestampType) => {
    const marketCloseTime = getMarketCloseMillis(now);
    const isAfterMarketClose = isAfter(now, marketCloseTime) && isSameDay(marketCloseTime, now);

    return isAfterMarketClose;
};

export const isBeforeMarketClose = (now: TimestampType) => {
    const marketCloseTime = getMarketCloseMillis(now);
    const isBeforeMarketClose =
        (isBefore(now, marketCloseTime) || isEqual(now, marketCloseTime)) &&
        isSameDay(marketCloseTime, now);

    return isBeforeMarketClose;
};

export const isMarketOpening = (now: TimestampType) => {
    const premarketOpenToday = convertToLocalTime(
        set(now, {
            hours: 9,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        })
    );
    const nowMillis = now instanceof Date ? now.getTime() : now;

    return premarketOpenToday.getTime() == nowMillis;
};

export const getMarketOpenMillis = (now: TimestampType) => {
    const marketOpenToday = convertToLocalTime(
        set(now, {
            hours: 9,
            minutes: 30,
            seconds: 0,
            milliseconds: 0
        })
    );

    return marketOpenToday;
};

export const getMarketCloseMillis = (now: TimestampType) => {
    const marketCloseToday = convertToLocalTime(
        set(now, {
            hours: 15,
            minutes: 59,
            seconds: 59,
            milliseconds: 999
        })
    );
    return marketCloseToday;
};
