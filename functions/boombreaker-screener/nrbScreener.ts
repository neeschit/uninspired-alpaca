import { Calendar, TradeDirection } from "@neeschit/alpaca-trade-api";
import { BoomBreakerDataPoints } from "@neeschit/common-interfaces";
import {
    getGapPercentage,
    reduceToSingleBar,
    groupMinuteBarsAndReduce,
    findNarrowestBar,
    getVwapFromBars,
} from "@neeschit/symbol-data";
import { isBoom } from "@neeschit/boom-strategy";
import { formatISO, parseISO } from "date-fns";

export const nrbScreener = async ({
    symbol,
    epoch,
    calendar,
}: {
    symbol: string;
    epoch: number;
    calendar: Calendar[];
}): Promise<BoomBreakerDataPoints | null> => {
    const { gap, minuteBars } = await getGapPercentage({
        symbol,
        calendar,
        epoch,
        limit: 0,
    });

    const barsForBoom = minuteBars.slice(0, 5);

    const boomBar = reduceToSingleBar(barsForBoom);

    const isBoomConfirmed = await isBoom({
        symbol,
        gap,
        boomBar,
    });

    if (!isBoomConfirmed) {
        console.log(
            `${symbol} is not a boom bar, no reason to enter at ${formatISO(
                epoch
            )}`
        );
        return null;
    }

    const barsAfterBoom = groupMinuteBarsAndReduce(minuteBars.slice(5)).filter(
        (bar) => parseISO(bar.t).getTime() <= epoch
    );

    const narrowestBar = findNarrowestBar(barsAfterBoom);

    if (!narrowestBar) {
        console.log(
            "couldnt find a narrow range bar for " +
                symbol +
                " at" +
                formatISO(epoch)
        );
        return null;
    }
    const nrbToBoomRatio =
        Math.round(
            (Math.abs(boomBar.h - boomBar.l) /
                Math.abs(narrowestBar.h - narrowestBar.l)) *
                100
        ) / 100;

    const { max, min } = barsAfterBoom.reduce(
        ({ min, max }, bar) => {
            let newMin = min;
            let newMax = max;
            if (bar.l < min) {
                newMin = bar.l;
            }

            if (bar.h > max) {
                newMax = bar.h;
            }

            return {
                min: newMin,
                max: newMax,
            };
        },
        {
            min: barsAfterBoom[0].l,
            max: barsAfterBoom[0].h,
        }
    );

    console.log(max);
    console.log(min);

    const boomBarRange = Math.abs(boomBar.h - boomBar.l);

    const isShort = isBoomConfirmed.side === TradeDirection.sell;

    const boomRetraced = isShort
        ? boomBarRange - Math.abs(boomBar.l - max)
        : boomBarRange - Math.abs(boomBar.h - min);

    const boomBarRetracementSoFar = Math.round(boomRetraced * 100) / 100;

    const vwap = await getVwapFromBars({
        epoch,
        symbol,
        calendar,
    });

    const distanceFromVwap = isShort
        ? vwap - narrowestBar.l
        : narrowestBar.h - vwap;

    return {
        nrbToBoomRatio,
        distanceFromVwap,
        distanceFromBoomBarRange: 0,
        boomBarRetracementSoFar,
        nrb: narrowestBar,
    };
};
