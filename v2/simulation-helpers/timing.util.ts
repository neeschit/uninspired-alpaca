import { Calendar } from "@neeschit/alpaca-trade-api";
import { format, isSameDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { MarketTimezone } from "../../src/data/data.model";

const dateFormat = "yyyy-MM-dd";
const fifteenMinutes = 1000 * 60 * 15;

const getDateAndCurrentCalendarObject = (calendar: Calendar[], currentTimeEpoch: number) => {
    const currentDateString = format(currentTimeEpoch, dateFormat);

    const currentCalendarObject = calendar.find((c) => c.date === currentDateString);

    if (!currentCalendarObject) {
        throw new Error("no_calendar_found");
    }

    return {
        currentDateString,
        currentCalendarObject,
    };
};

export const isMarketOpening = (calendar: Calendar[], currentTimeEpoch: number) => {
    try {
        const { currentCalendarObject, currentDateString } = getDateAndCurrentCalendarObject(
            calendar,
            currentTimeEpoch
        );

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

export const isMarketClosing = (calendar: Calendar[], currentTimeEpoch: number) => {
    try {
        const { currentCalendarObject, currentDateString } = getDateAndCurrentCalendarObject(
            calendar,
            currentTimeEpoch
        );

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

export const isAfterMarketClose = (calendar: Calendar[], currentTimeEpoch: number) => {
    try {
        const { currentCalendarObject, currentDateString } = getDateAndCurrentCalendarObject(
            calendar,
            currentTimeEpoch
        );

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

export const isBeforeMarketOpening = (calendar: Calendar[], currentTimeEpoch: number) => {
    try {
        const { currentCalendarObject, currentDateString } = getDateAndCurrentCalendarObject(
            calendar,
            currentTimeEpoch
        );

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

export const isMarketOpen = (calendar: Calendar[], currentTimeEpoch: number) => {
    try {
        const { currentCalendarObject, currentDateString } = getDateAndCurrentCalendarObject(
            calendar,
            currentTimeEpoch
        );

        const marketOpenNYString = `${currentDateString} ${currentCalendarObject.open}:00.000`;
        const marketCloseNYString = `${currentDateString} ${currentCalendarObject.close}:00.000`;

        const marketOpenToday = zonedTimeToUtc(marketOpenNYString, MarketTimezone);
        const marketCloseToday = zonedTimeToUtc(marketCloseNYString, MarketTimezone);

        return (
            currentTimeEpoch >= marketOpenToday.getTime() &&
            currentTimeEpoch < marketCloseToday.getTime()
        );
    } catch (e) {
        return false;
    }
};
