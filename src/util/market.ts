import { isWeekend, set, isSameDay, isAfter, isBefore, isEqual, parse, parseISO } from "date-fns";
import { TimestampType, MarketTimezone } from "../data/data.model";
import { convertToLocalTime } from "./date";
import { format, zonedTimeToUtc } from "date-fns-tz";
import { Calendar } from "@alpacahq/alpaca-trade-api";

const marketHolidays = [
    "01-01-2015",
    "01-19-2015",
    "02-16-2015",
    "04-03-2015",
    "05-25-2015",
    "07-03-2015",
    "09-07-2015",
    "11-26-2015",
    "12-25-2015",
    "01-01-2016",
    "01-18-2016",
    "02-15-2016",
    "03-25-2016",
    "05-30-2016",
    "07-04-2016",
    "09-07-2016",
    "11-24-2016",
    "12-25-2016",
    "01-01-2017",
    "01-16-2017",
    "02-20-2017",
    "04-14-2017",
    "05-29-2017",
    "07-04-2017",
    "09-04-2017",
    "11-23-2017",
    "12-25-2017",
    "01-01-2018",
    "01-15-2018",
    "02-19-2018",
    "03-30-2018",
    "05-28-2018",
    "07-04-2018",
    "09-03-2018",
    "11-22-2018",
    "12-25-2018",
    "01-01-2019",
    "01-21-2019",
    "02-18-2019",
    "04-19-2019",
    "05-27-2019",
    "07-04-2019",
    "09-02-2019",
    "11-28-2019",
    "12-25-2019",
    "01-01-2020",
    "01-20-2020",
    "02-17-2020",
    "04-10-2020",
    "05-25-2020",
    "07-03-2020",
    "09-03-2020",
    "11-26-2020",
    "12-25-2020"
];

export const isMarketHoliday = (now: TimestampType = Date.now()) => {
    return marketHolidays.some(day => isSameDay(now, new Date(day)));
};

export const isMarketOpen = (now: TimestampType = Date.now()) => {
    const isWeekday = !isWeekend(now);
    const isNotHoliday = !isMarketHoliday(now);

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

export const isMarketClosing = (now: TimestampType) => {
    const marketOpenNYString = format(now, "yyyy-MM-dd") + " 15:30:00.000";

    const marketClosingStart = zonedTimeToUtc(marketOpenNYString, MarketTimezone);
    const nowMillis = now instanceof Date ? now.getTime() : now;

    return marketClosingStart.getTime() >= nowMillis;
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

export const confirmMarketOpen = (calendar: Calendar[], currentTimeEpoch: number) => {
    const dateFormat = "yyyy-MM-dd";
    const timeFormat = "HH:mm";
    const dateTimeFormat = `${dateFormat} ${timeFormat}`;
    const currentDateString = format(currentTimeEpoch, dateFormat);
    const currentCalendarObject = calendar.find(c => c.date === currentDateString);

    if (!currentCalendarObject) {
        return false;
    }

    const marketOpenNYString =
        format(currentTimeEpoch, "yyyy-MM-dd") + ` ${currentCalendarObject.open}:00.000`;
    const marketCloseNYString =
        format(currentTimeEpoch, "yyyy-MM-dd") + ` ${currentCalendarObject.close}:00.000`;

    const marketOpenToday = zonedTimeToUtc(marketOpenNYString, MarketTimezone);
    const marketCloseToday = zonedTimeToUtc(marketCloseNYString, MarketTimezone);

    return (
        currentTimeEpoch >= marketOpenToday.getTime() &&
        currentTimeEpoch < marketCloseToday.getTime()
    );
};
