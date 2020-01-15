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
                .map(bar => Math.abs(bar.h - bar.l))
                .filter(range => range);

            const volume = stockBars.reduce((sum, bar) => {
                if (!isToday(getDayForAlpacaTimestamp(bar.t))) return sum;
                sum += bar.v;
                return sum;
            }, 0);

            const symbolAverages = AVG_VOLUMES[symbol];

            const minRange = ranges.reduce((previousMin, currVal) => {
                if (currVal < previousMin) {
                    return currVal;
                }

                return previousMin;
            }, 100000);

            const isHighVol = symbolAverages && volume > 2 * symbolAverages.averageVolume;
            const narrowRange = ranges.slice(-3).every(range => range < 6 * minRange);

            /* if (isHighVol) {
                console.log(symbol);
                console.log('high ovl');
            } */
            
            if (narrowRange) {
                console.log(symbol);
            }
        });
    })
    .catch(console.log);
