import test from "ava";
import { parseFromTimeZone, convertToLocalTime } from "date-fns-timezone";
import sinon from "sinon";

import { Backtester } from "./backtest";
import { set, parseISO } from "date-fns";
import { MarketTimezone } from "../data/data.model";

test("Backtester - simulate days", t => {
    const startDate = parseISO("2019-01-01 12:01:36.386Z");
    const zonedStartDate = convertToLocalTime(
        set(startDate.getTime(), {
            hours: 9,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );
    const endDate = parseISO("2019-01-02 12:10:00.000Z");

    const zonedEndDate = convertToLocalTime(
        set(endDate.getTime(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        }),
        {
            timeZone: MarketTimezone
        }
    );

    const clock = sinon.useFakeTimers(zonedStartDate.getTime());

    const instance = new Backtester(60000, zonedStartDate, zonedEndDate);

    instance.init(clock);

    let intervalCount = 0;

    instance.tradeUpdater.on("interval hit", () => {
        intervalCount++;
    });

    clock.tick(60000 * 60 * 26);

    t.is(intervalCount, 390);

    clock.restore();
});
