const { getDayBars } = require("../data/bars.js");
const { readFileSync } = require("fs");
const { getAverageTrueRange } = require("../indicator/trueRange.js");
const { getAverageDirectionalIndex } = require("../indicator/adx.js");

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

const lookback = process.argv[2] && Number(process.argv[2]);

let list = JSON.parse(JSON.stringify(LARGE_CAPS));
/* 
const barsFetched = [];

while (list.length > 200) { */
const barsPromise = getDayBars(list, 100, lookback);

/* 
    barsFetched.push(barsPromise);
    list = list.slice(200);
} */

barsPromise
    .then(responses => {
        console.log(responses.length);
        const bars = {};

        responses.map(response => {
            Object.assign(bars, response);
        });

        return Promise.resolve(bars);
    })
    .then(stocksBars => {
        const rangeLists = [[], [], [], [], []];
        Object.keys(stocksBars).map(symbol => {
            const bars = stocksBars[symbol];

            const [atr, tr] = getAverageTrueRange(bars);
            /* const tr = bars.map(bar => bar.h - bar.l); */

            let nr3 = Number.MAX_SAFE_INTEGER,
                nr4 = Number.MAX_SAFE_INTEGER,
                nr5 = Number.MAX_SAFE_INTEGER,
                nr6 = Number.MAX_SAFE_INTEGER,
                nr7 = Number.MAX_SAFE_INTEGER;

            tr.slice(-7).map((range, index) => {
                if (range < nr7) {
                    nr7 = range;
                }
                if (index > 0 && range < nr6) {
                    nr6 = range;
                }
                if (index > 1 && range < nr5) {
                    nr5 = range;
                }
                if (index > 2 && range < nr4) {
                    nr4 = range;
                }
                if (index > 3 && range < nr3) {
                    nr3 = range;
                }
            });

            if (tr[tr.length - 1] <= nr7) {
                rangeLists[4].push(symbol);
            }
            if (tr[tr.length - 1] <= nr6) {
                rangeLists[3].push(symbol);
            }
            if (tr[tr.length - 1] <= nr5) {
                rangeLists[2].push(symbol);
            }
            if (tr[tr.length - 1] <= nr4) {
                rangeLists[1].push(symbol);
            }
            if (tr[tr.length - 1] <= nr3) {
                rangeLists[0].push(symbol);
            }
        });
        return {
            stocksBars,
            lists: rangeLists
        };
    })
    .then(({ stocksBars, lists }) => {
        const nr = lists[4];

        nr.forEach(symbol => {
            const bars = stocksBars[symbol];
            const [adx, pdx, ndx, atr] = getAverageDirectionalIndex(bars);

            const chosenAdx = adx[adx.length - 1];

            if (chosenAdx.value > 30) {
                console.log(symbol + " - " + atr[atr.length - 1].value);
            }
        });
    })
    .catch(console.log);
