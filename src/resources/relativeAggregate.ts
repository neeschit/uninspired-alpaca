import { currentStreamingSymbols } from "../data/filters";
import { addBusinessDays, isSameDay, startOfDay } from "date-fns";
import { getSimpleData } from "./stockData";
import { LOGGER } from "../instrumentation/log";
import { isMarketOpen, confirmMarketOpen } from "../util/market";
import { alpaca } from "./alpaca";
import { Bar } from "../data/data.model";
import { Calendar } from "@neeschit/alpaca-trade-api";

const createHypertable = (tablename: string, column: string, interval = "1 day") => `
SELECT create_hypertable('${tablename}', '${column}');

SELECT set_chunk_time_interval('${tablename}', interval '${interval}');
`;

export interface HistoricalMinuteAggregate {
    averageVolume: number;
    periodCount: number;
    index: number;
}

export const historicallyAggregateIndicatorsPerMinute = async (
    startDate = addBusinessDays(Date.now(), -90)
) => {
    const calendar = await alpaca.getCalendar({
        start: startOfDay(startDate),
        end: new Date(),
    });

    return currentStreamingSymbols.map(async (symbol) => {
        const symbolData = await getSimpleData(symbol, startDate.getTime(), true);

        return {
            aggregated: await singleSymbol(symbolData, calendar),
            symbol,
        };
    });
};

const singleSymbol = async (barData: Bar[], calendar: Calendar[]) => {
    barData = barData.filter((b) => confirmMarketOpen(calendar, b.t));

    let current: Bar[] = [];
    let currentDate = barData[0].t;

    const dailySplits = barData.reduce((summary, bar, index) => {
        if (!isSameDay(bar.t, currentDate)) {
            summary.push(current);
            current = [];
        }
        current.push(bar);

        if (index === barData.length - 1) {
            summary.push(current);
        }
        currentDate = bar.t;

        return summary;
    }, [] as Bar[][]);

    const aggregates = dailySplits.reduce((aggregates, dayBars) => {
        const mappedDay: HistoricalMinuteAggregate[] = dayBars.map((bar) => {
            const index = (bar.t - dayBars[0].t) / 60000;

            return {
                index,
                averageVolume: bar.v,
                periodCount: 1,
            };
        });

        if (!aggregates.length) {
            return mappedDay;
        }

        aggregates = aggregates.map((aggregate, i) => {
            const today = mappedDay.find((d) => d.index === i);

            if (!today) {
                return aggregate;
            }

            const totalVolume = aggregate.averageVolume * aggregate.periodCount;

            aggregate.periodCount += today.periodCount;
            aggregate.averageVolume = (totalVolume + today.averageVolume) / aggregate.periodCount;

            return aggregate;
        });

        return aggregates;
    }, [] as HistoricalMinuteAggregate[]);

    return aggregates;
};
