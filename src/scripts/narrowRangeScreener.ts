import { getDayBars } from "../data/bars";
import { readFileSync } from "fs";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { LOGGER } from "../instrumentation/log";
import { getHighVolumeCompanies } from "../data/filters";
import { alpaca } from "../resources/alpaca";

const LARGE_CAPS = getHighVolumeCompanies();

const lookback = process.argv[2] && Number(process.argv[2]);

let list = JSON.parse(JSON.stringify(LARGE_CAPS));
/* 
const barsFetched = [];

while (list.length > 200) { */
const barsPromise = getDayBars(list, 100, Number(lookback || 1));

/* 
    barsFetched.push(barsPromise);
    list = list.slice(200);
} */
LOGGER.info(
    new Date(new Date().setDate(new Date().getDate() - (lookback || 366))).toLocaleDateString()
);

barsPromise
    .then(responses => {
        LOGGER.debug(responses.length);
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
                    LOGGER.warn("no bars");

                    return null;
                }

                try {
                    return new NarrowRangeBarStrategy({
                        period: 7,
                        symbol,
                        bars,
                        useSimpleRange: false,
                        counterTrend: false,
                        broker: alpaca
                    });
                } catch (e) {
                    return null;
                }
            })
            .filter(instance => instance && instance.checkIfFitsStrategy(false));

        const symbols = nrbInstances.map(n => n?.symbol);

        symbols.map(s => console.log(s));
    })
    .catch(LOGGER.error);
