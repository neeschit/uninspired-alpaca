import { getDayBars } from "../data/bars.js";
import { readFileSync } from "fs";

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

let list = JSON.parse(JSON.stringify(LARGE_CAPS));

const barsFetched = [];

while (list.length > 200) {
  const barsPromise = getDayBars(list.slice(0, 200), 100);

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
    Object.keys(bars).map(symbol => {
      const stockBars = bars[symbol];

      const ranges = stockBars.slice(-25).map(bar => Math.abs(bar.h - bar.l));

      const minRange = ranges.reduce((previousMin, currVal) => {
        if (currVal < previousMin) {
          return currVal;
        }

        return previousMin;
      }, 100000);

      if (ranges[ranges.length - 1] === minRange) {
        console.log(symbol);
      }
    });
  })
  .catch(console.log);
