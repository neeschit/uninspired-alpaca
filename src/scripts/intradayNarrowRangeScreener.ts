import { getIntradayBars } from "../data/bars";
import { Bar, PeriodType, DefaultDuration } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { getHighVolumeCompanies } from "../data/filters";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { alpaca } from "../resources/alpaca";

const LARGE_CAPS = getHighVolumeCompanies();

const lookback = process.argv[2] && Number(process.argv[2]);

let list = JSON.parse(JSON.stringify(LARGE_CAPS));

const barsFetched = [];

while (list.length > 200 || list.length) {
    const barsPromise = getIntradayBars(list.slice(0, 200), 1, 0, PeriodType.minute, DefaultDuration.five);

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
    .then((bars: any) => {
        let count = 0;
        Object.keys(bars).map(index => {
            const symbol = Object.keys(bars[index])[0];

            const nrb = new NarrowRangeBarStrategy({
                period: 7,
                bars: bars[index][symbol],
                useSimpleRange: false,
                counterTrend: false,
                broker: alpaca,
                symbol
            });

            if (nrb.checkIfFitsStrategy()) {
                LOGGER.info(symbol);
            }
        });
    })
    .catch(LOGGER.info);
