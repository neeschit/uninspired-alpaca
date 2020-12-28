import { getCalendar } from "../brokerage-helpers/alpaca";
import {
    isAfterMarketClose,
    isBeforeMarketOpening,
    isMarketClosing,
    isMarketOpen,
    isMarketOpening,
} from "./timing.util";

test("isMarketOpening", async () => {
    const calendar = await getCalendar(
        new Date("11-25-2020"),
        new Date("11-28-2020")
    );

    const tgivingEpoch = 1606401900000;

    expect(isMarketOpening(calendar, tgivingEpoch)).toEqual(false);

    const dayAfterEpoch = 1606486800000;

    expect(isMarketOpening(calendar, dayAfterEpoch)).toEqual(true);
});

test("isBeforeMarketOpen", async () => {
    const calendar = await getCalendar(
        new Date("11-25-2020"),
        new Date("11-28-2020")
    );

    const tgivingEpoch = 1606401900000;

    expect(isBeforeMarketOpening(calendar, tgivingEpoch)).toEqual(false);

    const dayAfterEpoch = 1606486000000;

    expect(isBeforeMarketOpening(calendar, dayAfterEpoch)).toEqual(true);
});

test("isMarketOpen", async () => {
    const calendar = await getCalendar(
        new Date("11-25-2020"),
        new Date("11-28-2020")
    );

    const tgivingEpoch = 1606401900000;

    expect(isMarketOpen(calendar, tgivingEpoch)).toEqual(false);

    const dayAfterEpoch = 1606487400000;

    expect(isMarketOpen(calendar, dayAfterEpoch)).toEqual(true);
});

test("isMarketClosing", async () => {
    const calendar = await getCalendar(
        new Date("11-25-2020"),
        new Date("11-28-2020")
    );

    const dayAterEpochStillOpen = 1606500900000 - 60000 * 10;

    expect(isMarketClosing(calendar, dayAterEpochStillOpen)).toEqual(false);

    const dayAfterEpoch = 1606499100000;

    expect(isMarketClosing(calendar, dayAfterEpoch)).toEqual(true);

    const openMarketDayAfter5 = 1606337100000;

    expect(isMarketClosing(calendar, openMarketDayAfter5)).toEqual(true);
});

test("isAterMarketClose", async () => {
    const calendar = await getCalendar(
        new Date("11-25-2020"),
        new Date("11-28-2020")
    );

    const tgivingDayAfter5 = 1606430700000;

    expect(isAfterMarketClose(calendar, tgivingDayAfter5)).toEqual(false);

    const dayAfterEpoch = 1606501860000;

    expect(isAfterMarketClose(calendar, dayAfterEpoch)).toEqual(true);

    const openMarketDayAfter5 = 1606344300000;

    expect(isAfterMarketClose(calendar, openMarketDayAfter5)).toEqual(true);
});

test("exceptions", async () => {
    expect(isMarketClosing([], 1606344300000)).toEqual(false);
    expect(isAfterMarketClose([], 1606344300000)).toEqual(false);
    expect(isMarketOpen([], 1606344300000)).toEqual(false);
    expect(isBeforeMarketOpening([], 1606344300000)).toEqual(false);
    expect(isMarketOpening([], 1606344300000)).toEqual(false);
});
