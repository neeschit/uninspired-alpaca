const { readFileSync } = require("fs");
const { isToday } = require("date-fns");
const { getDayForAlpacaTimestamp } = require("../util");

const { getIntradayBars } = require("../data/bars.js");

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

const AVG_VOLUMES = JSON.parse(
    readFileSync("./sixtyDayAvgVol.json").toString()
);

const lookback = process.argv[2] && Number(process.argv[2]);

let list = JSON.parse(JSON.stringify(LARGE_CAPS));

const barsFetched = [];

while (list.length > 200) {
    const barsPromise = getIntradayBars(list.slice(0, 200), 1, lookback);

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
    .then(bars => {
        let count = 0;
        Object.keys(bars).map(symbol => {
            const stockBars = bars[symbol];

            const ranges = stockBars
                .filter(bar => {
                    return isToday(getDayForAlpacaTimestamp(bar.t));
                })
                .map(bar => {
                    const range = Math.abs(bar.h - bar.l);

                    if (!range) {
                        return 0.35;
                    }

                    return range;
                })

            const volume = stockBars.reduce((sum, bar) => {
                if (!isToday(getDayForAlpacaTimestamp(bar.t))) return sum;
                sum += bar.v;
                return sum;
            }, 0);

            const symbolAverages = AVG_VOLUMES[symbol];

            const { previousMin: minRange, previousMax: maxRange } = ranges.reduce(({ previousMin, previousMax }, currVal) => {
                if (currVal < previousMin) {
                    previousMin = currVal;
                }
                
                if (currVal > previousMax) {
                    previousMax = currVal;
                }

                return {
                    previousMin,
                    previousMax
                };
            }, {
                previousMin: 10000,
                previousMax: Number.MIN_SAFE_INTEGER
            });

            const isHighVol = symbolAverages && volume > 2 * symbolAverages.averageVolume;
            const rangeRatio = maxRange / minRange;

            const threshold = 2;

            const narrowRange = ranges.slice(-3).filter(range => range < maxRange / 6).length > threshold;

            /* if (isHighVol) {
                console.log(symbol);
                console.log('high ovl');
            } */
            
            if (narrowRange) {
                console.log(symbol);
                console.log(count++);
            }
        });
    })
    .catch(console.log);
