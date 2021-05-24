import { format, addBusinessDays } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export const DATE_FORMAT = "yyyy-MM-dd";
export const MarketTimezone = "America/New_York";

export interface Calendar {
    open: string;
    close: string;
    date: string;
}

export function getMarketOpenTimeForDay(
    epoch: number,
    calendar: Calendar[]
): number {
    try {
        return _getMarketTimeForDay(epoch, calendar, 0, false, true);
    } catch (e) {
        throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
    }
}

export function getMarketCloseTimeForDay(
    epoch: number,
    calendar: Calendar[]
): number {
    try {
        return _getMarketTimeForDay(epoch, calendar, 0, false, false);
    } catch (e) {
        throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
    }
}

export function getMarketOpenTimeForYday(
    epoch: number,
    calendar: Calendar[]
): number {
    try {
        return _getMarketTimeForDay(
            addBusinessDays(epoch, -1).getTime(),
            calendar,
            0,
            true,
            true
        );
    } catch (e) {
        throw new Error(`no_calendar_found_${format(epoch, "yyyy-MM-dd")}`);
    }
}

export function _getMarketTimeForDay(
    epoch: number,
    calendar: Calendar[],
    attempt: number,
    goBackwards: boolean,
    isOpen: boolean
): number {
    const todaysDate = format(epoch, DATE_FORMAT);

    const calendarEntry = calendar.find((c) => c.date === todaysDate);

    if (!calendarEntry && attempt < 5) {
        return _getMarketTimeForDay(
            addBusinessDays(epoch, goBackwards ? -1 : 1).getTime(),
            calendar,
            ++attempt,
            goBackwards,
            isOpen
        );
    } else if (!calendarEntry) {
        throw new Error(`no_calendar_found`);
    }

    const dateString =
        todaysDate +
        `T${isOpen ? calendarEntry.open : calendarEntry.close}:00.000`;

    const marketOpenToday = zonedTimeToUtc(dateString, MarketTimezone);

    return marketOpenToday.getTime();
}