import DateFnsTz from "date-fns-tz";
import { TimestampType, MarketTimezone } from "../data/data.model";

const { utcToZonedTime, zonedTimeToUtc, format } = DateFnsTz;

export const convertToLocalTime = (
    date: TimestampType,
    timeString: string,
    timeZone: string = MarketTimezone
) => {
    const dateString = format(date, "yyyy-MM-dd") + timeString;
    if (new Date().getTimezoneOffset()) {
        return utcToZonedTime(dateString, timeZone);
    } else {
        return zonedTimeToUtc(dateString, timeZone);
    }
};

export const formatInEasternTimeForDisplay = (date: TimestampType) => {
    return format(date, "yyyy-MM-dd hh:mm:ss", {
        timeZone: MarketTimezone,
    });
};
