import { utcToZonedTime, format } from "date-fns-tz";
import { TimestampType, MarketTimezone } from "../data/data.model";

export const convertToLocalTime = (date: TimestampType, timeZone: string = MarketTimezone) => {
    return utcToZonedTime(date, timeZone);
};

export const formatInEasternTimeForDisplay = (date: TimestampType) => {
    return format(date, "yyyy-MM-dd hh:mm:ss", {
        timeZone: MarketTimezone
    });
};
