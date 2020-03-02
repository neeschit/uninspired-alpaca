import { getDayBars } from "../data/bars";
import { readFileSync } from "fs";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

const lookback = process.argv[2] && Number(process.argv[2]);

let list = JSON.parse(JSON.stringify(LARGE_CAPS));
/* 
const barsFetched = [];

while (list.length > 200) { */
const barsPromise = getDayBars(list, 430, Number(lookback || 366));

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
    .then((stocksBars: any) => {
        const nrbInstances: (NarrowRangeBarStrategy | null)[] = Object.keys(stocksBars)
            .map(symbol => {
                const bars = stocksBars[symbol];

                if (!bars) {
                    console.log("no bars");

                    return null;
                }

                return new NarrowRangeBarStrategy({
                    period: 7,
                    symbol,
                    bars
                });
            })
            .filter(instance => instance && instance.checkIfFitsStrategy());

        nrbInstances
            .filter(n => {
                return n!.hasPotentialForRewards();
            })
            .map(n => console.log(n!.toString()));
    })
    .catch(console.error);
