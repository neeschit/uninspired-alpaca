import { readFileSync, writeFileSync } from "fs";
import { startOfDay, isSameDay } from "date-fns";
import { getDayForAlpacaTimestamp } from "../util";

import { getIntradayBars } from "../data/bars";
import { Bar } from "../connection/bar";

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

let list = JSON.parse(JSON.stringify(LARGE_CAPS));

const barsFetched = [];

while (list.length > 200) {
    const barsPromise = getIntradayBars(list.slice(0, 200), 90, 1);

    barsFetched.push(barsPromise);

    list = list.slice(200);
}

Promise.all(barsFetched)
    .then(responses => {
        const bars = {};

        responses.map(response => {
            Object.assign(bars, response);
        });

        return Promise.resolve(bars);
    })
    .then((symbols: any) => {
        return Object.keys(symbols)
            .map(symbol => {
                const bars: Bar[] = symbols[symbol];
                if (!bars.length) {
                    return 0;
                }

                let currentDay = startOfDay(
                    getDayForAlpacaTimestamp(bars[0].t)
                );

                return bars.reduce(
                    (acc, currentBar, index) => {
                        let { averageVolume, currentVolume, days } = acc[
                            symbol
                        ];
                        if (
                            isSameDay(
                                getDayForAlpacaTimestamp(currentBar.t),
                                currentDay
                            )
                        ) {
                            currentVolume += currentBar.v;
                        } else {
                            averageVolume += currentVolume;
                            currentVolume = currentBar.v;
                            currentDay = startOfDay(
                                getDayForAlpacaTimestamp(currentBar.t)
                            );
                            days++;
                        }

                        if (index === bars.length - 1) {
                            averageVolume /= days;
                        }

                        return {
                            [symbol]: {
                                currentVolume,
                                averageVolume,
                                days
                            }
                        };
                    },
                    {
                        [symbol]: {
                            currentVolume: 0,
                            averageVolume: 0,
                            days: 1
                        }
                    }
                );
            })
            .reduce((reducedBars, bar) => {
                return Object.assign(reducedBars, bar);
            }, {});
    })
    .then(bars => {
        writeFileSync("sixtyDayAvgVol.json", JSON.stringify(bars));
    });
