import { Storage } from "@google-cloud/storage";
import { SimpleBar } from "@neeschit/common-interfaces";
import { readFileFromBucket } from "./bucketFileReader";

const storage = new Storage();

const bucket = storage.bucket("first-five");

export interface BoomStrategyScreenRequest {
    symbol: string;
    boomBar: SimpleBar;
    gap: number;
}

export const isBoom = async ({
    symbol,
    boomBar,
    gap,
}: BoomStrategyScreenRequest) => {
    if (gap > 1.8 || gap < -1.8) {
        return null;
    }

    const fileName = `${symbol.toLowerCase()}.json`;

    const firstFiveHistoricalAggregate: any = await readFileFromBucket(
        fileName,
        bucket
    );

    const firstFive: {
        averageRange: number;
        averageVolume: number;
    } = JSON.parse(firstFiveHistoricalAggregate);

    const averageRange = Math.round(firstFive.averageRange * 100) / 100;

    const averageVolume = Math.round(firstFive.averageVolume);

    const isBoom = isElephantBar(boomBar);

    const side: any =
        Math.abs(boomBar.c - boomBar.l) < Math.abs(boomBar.c - boomBar.h)
            ? "sell"
            : "buy";

    const range = Math.abs(boomBar.h - boomBar.l);
    const rangeRatio = Math.round((range / averageRange) * 100) / 100;
    const isSignifcantlyLargeBar = rangeRatio >= 1;

    if (isBoom && !isSignifcantlyLargeBar) {
        console.log(
            symbol + " is an elephant bar but has range ratio of " + rangeRatio
        );
    }

    return isBoom && isSignifcantlyLargeBar
        ? {
              side,
              limitPrice: boomBar.c,
              relativeVolume: boomBar.v / averageVolume,
              relativeRange: rangeRatio,
          }
        : null;
};

export const isElephantBar = (bar: SimpleBar, requiredRatio = 0.14) => {
    const wicksRange =
        bar.o > bar.c ? Math.abs(bar.l - bar.c) : Math.abs(bar.h - bar.c);

    if (wicksRange / Math.abs(bar.h - bar.l) > requiredRatio) {
        return false;
    }

    return true;
};
