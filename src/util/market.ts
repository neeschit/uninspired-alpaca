import { isWeekend, set, isSameDay, isAfter, isBefore, isEqual } from "date-fns";
import { TimestampType, MarketTimezone } from "../data/data.model";
import { convertToLocalTime } from "./date";
import { format, zonedTimeToUtc } from "date-fns-tz";

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
    const marketOpenNYString = format(now, "yyyy-MM-dd") + " 09:00:00.000";

    const premarketOpenToday = zonedTimeToUtc(marketOpenNYString, MarketTimezone);
    const nowMillis = now instanceof Date ? now.getTime() : now;

    return premarketOpenToday.getTime() == nowMillis;
};

export const getMarketOpenMillis = (now: TimestampType) => {
    const marketOpenNYString = format(now, "yyyy-MM-dd") + " 09:30:00.000";

    const marketOpenToday = zonedTimeToUtc(marketOpenNYString, MarketTimezone);
    return marketOpenToday;
};

export const getMarketCloseMillis = (now: TimestampType) => {
    const marketCloseNYString = format(now, "yyyy-MM-dd") + " 15:59:59.999";

    const marketCloseToday = zonedTimeToUtc(marketCloseNYString, MarketTimezone);

    return marketCloseToday;
};
