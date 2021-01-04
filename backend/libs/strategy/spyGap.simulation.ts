import {
    Calendar,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays } from "date-fns";
import { createOneTriggersAnotherOrder } from "../brokerage-helpers/alpaca";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getTrueRange } from "../core-indicators/indicator/trueRange";
import { DefaultDuration, PeriodType } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertDailyBars,
    getData,
    getSimpleData,
} from "../core-utils/resources/stockData";
import { convertToLocalTime } from "../core-utils/util/date";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import { FIFTEEN_MINUTES } from "../simulation-helpers/timing.util";
import { cancelOpenOrdersForSymbol } from "../trade-management-helpers/order";

export const isTimeForGapCloseEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:15:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:27:58.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};

export class SpyGapCloseSimulation implements SimulationStrategy {
    private isGapDay = false;
    private hasCachedData = false;
    constructor(private symbol: string, private broker: BrokerStrategy) {}

    async beforeMarketStarts(epoch: number) {
        const startBusinessDay = addBusinessDays(epoch, -5);
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (this.isInPlay()) {
            return;
        }

        if (process.env.NODE_ENV !== "backtest" && !this.hasCachedData) {
            const daysMinutes = await getPolyonData(
                this.symbol,
                startBusinessDay,
                lastBusinessDay,
                PeriodType.day,
                DefaultDuration.one
            );

            try {
                await batchInsertDailyBars(
                    daysMinutes[this.symbol],
                    this.symbol
                );
            } catch (e) {
                LOGGER.error(`Error inserting daily bar for ${this.symbol}`, e);
            }

            try {
                const todaysMinutes = await getPolyonData(
                    this.symbol,
                    lastBusinessDay,
                    addBusinessDays(epoch, 1),
                    PeriodType.minute
                );
                await batchInsertDailyBars(
                    todaysMinutes[this.symbol],
                    this.symbol
                );
                this.hasCachedData = true;
            } catch (e) {
                LOGGER.error(
                    `Error inserting minute bars for ${this.symbol}`,
                    e
                );
            }
        }

        const data = await getSimpleData(
            this.symbol,
            addBusinessDays(epoch, -5).getTime(),
            false,
            lastBusinessDay.getTime()
        );
        const currentBars = await getSimpleData(
            this.symbol,
            epoch - FIFTEEN_MINUTES,
            true,
            epoch + 1000
        );

        const currentBar = currentBars[currentBars.length - 1];

        const price = currentBar.c;
        const previousClose = data[data.length - 1].c;

        const gap = Math.abs(previousClose - price);

        if (gap < 0.2) {
            this.isGapDay = false;
            return;
        }

        const previousDayRange = getTrueRange(data.slice(-2), false);

        if (gap > previousDayRange * 0.85 || gap < previousDayRange * 0.15) {
            this.isGapDay = false;
            return;
        }

        this.isGapDay = true;

        this.broker.createOneTriggersAnotherOrder({
            symbol: this.symbol,
            time_in_force: TimeInForce.opg,
            qty: 100,
            side:
                previousClose > price
                    ? TradeDirection.buy
                    : TradeDirection.sell,
            type: TradeType.market,
            order_class: "oto",
            extended_hours: false,
            take_profit: {
                limit_price: previousClose,
            },
        });
    }

    async beforeMarketCloses(epoch: number) {
        if (!this.isInPlay()) {
            return;
        }
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }

    async onMarketClose() {}

    async afterEntryTimePassed(epoch: number) {}

    async rebalance(calendar: Calendar[], epoch: number) {}

    hasEntryTimePassed(epoch: number) {
        return isTimeForGapCloseEntry(epoch);
    }

    isInPlay() {
        return this.isGapDay;
    }
}
