import { Calendar } from "@neeschit/alpaca-trade-api";
import { Bar } from "../core-utils/data/data.model";
import {
    selectAverageVolumeFirstBarForWindowLive,
    selectAverageRangeFirstBarForWindowLive,
} from "../core-utils/resources/firstFiveMinBar";
import { getData, getGapForSymbol } from "../core-utils/resources/stockData";
import { Simulator } from "../simulation-helpers/simulator";

export const getBoomBarData = async (
    calendar: Calendar[],
    epoch: number,
    symbol: string
) => {
    const marketStartEpochToday = Simulator.getMarketOpenTimeForDay(
        epoch,
        calendar
    );

    const minutesSinceMarketOpen =
        epoch > marketStartEpochToday
            ? Math.floor((epoch - marketStartEpochToday) / 300000)
            : 0;

    if (!minutesSinceMarketOpen) {
        return [];
    }

    const data = await getData(
        symbol,
        marketStartEpochToday,
        "5 minutes",
        epoch
    );

    return data.slice(0, minutesSinceMarketOpen);
};

export const screenForBoomBar = async (
    calendar: Calendar[],
    epoch: number,
    symbol: string
) => {
    const marketStartEpochToday = Simulator.getMarketOpenTimeForDay(
        epoch,
        calendar
    );

    const data = await getBoomBarData(calendar, epoch, symbol);

    const premarketEpoch = Simulator.getPremarketTimeForDay(epoch, calendar);
    const ydayOpen = Simulator.getMarketOpenTimeForYday(epoch, calendar);

    const boomBar = data[0];

    let isBoomBar = false;

    const averageVol = await selectAverageVolumeFirstBarForWindowLive(
        symbol,
        90,
        epoch
    );

    const averageFirstBarRange = await selectAverageRangeFirstBarForWindowLive(
        symbol,
        epoch
    );

    const range = Math.abs(boomBar.h - boomBar.l);

    if (range > 3 * averageFirstBarRange!) {
        isBoomBar = true;
    } else {
        isBoomBar = false;
    }

    isBoomBar = isBoomBar && isElephantBar(boomBar);

    const gap = await getGapForSymbol(
        symbol,
        ydayOpen,
        epoch,
        premarketEpoch,
        marketStartEpochToday
    );

    return {
        isBoomBar,
        data,
        averageVol,
        gap,
        boomBar,
    };
};

const isElephantBar = (bar: Bar) => {
    const bodyRange = Math.abs(bar.o - bar.c);
    const wicksRange =
        bar.o > bar.c
            ? Math.abs(bar.h - bar.o) + Math.abs(bar.l - bar.c)
            : Math.abs(bar.h - bar.c) + Math.abs(bar.l - bar.o);

    if (wicksRange / bodyRange > 0.15) {
        return false;
    }

    return true;
};
