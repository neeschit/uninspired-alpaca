import { Calendar } from "@neeschit/alpaca-trade-api";
import DateFns from "date-fns";
import DateFnsTz from "date-fns-tz";
import { MarketTimezone } from "../../src/data/data.model.js";

const { format, isSameDay } = DateFns;
const { zonedTimeToUtc } = DateFnsTz;

export const DATE_FORMAT = "yyyy-MM-dd";
const fifteenMinutes = 1000 * 60 * 15;

const getDateAndCurrentCalendarObject = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    const currentDateString = format(currentTimeEpoch, DATE_FORMAT);
    const currentCalendarObject = calendar.find(
        (c) => c.date === currentDateString
    );

    if (!currentCalendarObject) {
        throw new Error("no_calendar_found");
    }

    return {
        currentDateString,
        currentCalendarObject,
    };
};

export const isMarketOpening = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    try {
        const {
            currentCalendarObject,
            currentDateString,
        } = getDateAndCurrentCalendarObject(calendar, currentTimeEpoch);

        const openTime = `${currentDateString}T${currentCalendarObject.open}:00.000`;
        const marketOpenToday = zonedTimeToUtc(openTime, MarketTimezone);

        return (
            marketOpenToday.getTime() - fifteenMinutes <= currentTimeEpoch &&
            currentTimeEpoch < marketOpenToday.getTime()
        );
    } catch (e) {
        return false;
    }
};

export const isMarketClosing = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    try {
        const {
            currentCalendarObject,
            currentDateString,
        } = getDateAndCurrentCalendarObject(calendar, currentTimeEpoch);

        const closeTime = `${currentDateString}T${currentCalendarObject.close}:00.000`;
        const marketCloseToday = zonedTimeToUtc(closeTime, MarketTimezone);

        return (
            marketCloseToday.getTime() - fifteenMinutes <= currentTimeEpoch &&
            currentTimeEpoch < marketCloseToday.getTime()
        );
    } catch (e) {
        return false;
    }
};

export const isAfterMarketClose = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    try {
        const {
            currentCalendarObject,
            currentDateString,
        } = getDateAndCurrentCalendarObject(calendar, currentTimeEpoch);

        const closeTime = `${currentDateString}T${currentCalendarObject.close}:00.000`;
        const marketCloseToday = zonedTimeToUtc(closeTime, MarketTimezone);

        return (
            currentTimeEpoch >= marketCloseToday.getTime() &&
            isSameDay(currentTimeEpoch, marketCloseToday)
        );
    } catch (e) {
        return false;
    }
};

export const isBeforeMarketOpening = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    try {
        const {
            currentCalendarObject,
            currentDateString,
        } = getDateAndCurrentCalendarObject(calendar, currentTimeEpoch);

        const openTime = `${currentDateString}T${currentCalendarObject.open}:00.000`;
        const marketOpenToday = zonedTimeToUtc(openTime, MarketTimezone);

        return (
            marketOpenToday.getTime() > currentTimeEpoch &&
            isSameDay(currentTimeEpoch, marketOpenToday)
        );
    } catch (e) {
        return false;
    }
};

export const isMarketOpen = (
    calendar: Calendar[],
    currentTimeEpoch: number
) => {
    try {
        const {
            currentCalendarObject,
            currentDateString,
        } = getDateAndCurrentCalendarObject(calendar, currentTimeEpoch);

        const marketOpenNYString = `${currentDateString} ${currentCalendarObject.open}:00.000`;
        const marketCloseNYString = `${currentDateString} ${currentCalendarObject.close}:00.000`;

        const marketOpenToday = zonedTimeToUtc(
            marketOpenNYString,
            MarketTimezone
        );
        const marketCloseToday = zonedTimeToUtc(
            marketCloseNYString,
            MarketTimezone
        );

        return (
            currentTimeEpoch >= marketOpenToday.getTime() &&
            currentTimeEpoch < marketCloseToday.getTime()
        );
    } catch (e) {
        return false;
    }
};

export const getMarketOpenMillis = (calendar: Calendar[], epoch: number) => {
    const todaysDate = format(epoch, DATE_FORMAT);

    const calendarEntry = calendar.find((c) => c.date === todaysDate);

    const dateString = todaysDate + `T${calendarEntry!.open}:00.000`;

    const marketOpenToday = zonedTimeToUtc(dateString, MarketTimezone);

    return marketOpenToday.getTime();
};
