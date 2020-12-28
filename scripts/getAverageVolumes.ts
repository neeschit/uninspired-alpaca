import { readFileSync, writeFileSync } from "fs";
import { addDays } from "date-fns";

import { getBarsByDate } from "../libs/core-utils/data/bars";
import {
    DefaultDuration,
    PeriodType,
} from "../libs/core-utils/data/data.model";
import { LOGGER } from "../libs/core-utils/instrumentation/log";

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

let list = JSON.parse(JSON.stringify(LARGE_CAPS));

const barsFetched = [];

while (list.length > 200) {
    for (const symbol of list.slice(0, 200)) {
        const barsPromise = getBarsByDate(
            symbol,
            addDays(Date.now(), -20),
            new Date(),
            DefaultDuration.one,
            PeriodType.day
        );

        barsFetched.push(barsPromise);
    }

    list = list.slice(200);
}

Promise.all(barsFetched)
    .then((allBars) => {
        let array: {
            averageVolume: number;
            symbol: string;
            t: number;
        }[] = [];

        array = allBars
            .map((bars, index) => {
                if (!bars.length) {
                    LOGGER.warn(`no bars for ${LARGE_CAPS[index]}`);
                    return {
                        symbol: LARGE_CAPS[index],
                        averageVolume: 0,
                        t: 0,
                    };
                }

                return bars.reduce(
                    (acc, currentBar) => {
                        let {
                            averageVolume,
                            currentVolume,
                            days,
                            symbol,
                        } = acc;

                        currentVolume = currentBar.v;
                        days++;
                        averageVolume = currentVolume / days;

                        return {
                            currentVolume,
                            averageVolume,
                            days,
                            symbol,
                            t: currentBar.t,
                        };
                    },
                    {
                        currentVolume: 0,
                        averageVolume: 0,
                        days: 0,
                        symbol: LARGE_CAPS[index],
                        t: 0,
                    }
                );
            })
            .filter((b) => {
                LOGGER.debug(b.averageVolume);
                return b.averageVolume > 1000000;
            })
            .sort((a, b) => {
                return a.symbol > b.symbol ? 1 : -1;
            });

        writeFileSync(
            "largeCapsHighVolume.json",
            JSON.stringify(array.map((b) => b.symbol))
        );

        return array.reduce((acc, bar) => {
            return Object.assign(acc, {
                [bar.symbol]: {
                    averageVolume: bar.averageVolume,
                    t: bar.t,
                },
            });
        }, {});
    })
    .then((bars) => {
        writeFileSync("sixtyDayAvgVol.json", JSON.stringify(bars));
    });
