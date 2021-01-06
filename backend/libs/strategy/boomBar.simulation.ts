import {
    Calendar,
    PositionDirection,
    TimeInForce,
    TradeDirection,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { addBusinessDays, endOfDay } from "date-fns";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import { PeriodType } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertBars,
    getData,
    getYesterdaysEndingBars,
} from "../core-utils/resources/stockData";
import { convertToLocalTime } from "../core-utils/util/date";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import {
    getMarketOpenMillis,
    isMarketOpen,
} from "../simulation-helpers/timing.util";
import {
    cancelOpenOrdersForSymbol,
    createOrderSynchronized,
    getBracketOrderForPlan,
} from "../trade-management-helpers/order";
import { TradePlan } from "../trade-management-helpers/position";
import { PROFIT_RATIO, RISK_PER_ORDER } from "./narrowRangeBar";

export const isTimeForBoomBarEntry = (nowMillis: number) => {
    const timeStart = convertToLocalTime(nowMillis, " 09:34:45.000");
    const timeEnd = convertToLocalTime(nowMillis, " 09:35:15.000");

    const isWithinEntryRange =
        timeStart.getTime() <= nowMillis && timeEnd.getTime() >= nowMillis;

    return isWithinEntryRange;
};

export class BoomBarSimulation implements SimulationStrategy {
    private isScreened = false;
    private atrFromYdayClose?: number;
    private hasCachedData = false;

    constructor(private symbol: string, public broker: BrokerStrategy) {}

    async beforeMarketStarts(calendar: Calendar[], epoch: number) {
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (process.env.NODE_ENV !== "backtest" && !this.hasCachedData) {
            try {
                const todaysMinutes = await getPolyonData(
                    this.symbol,
                    lastBusinessDay,
                    addBusinessDays(epoch, 1),
                    PeriodType.minute
                );
                await batchInsertBars(todaysMinutes[this.symbol], this.symbol);
                this.hasCachedData = true;
            } catch (e) {
                LOGGER.error(
                    `Error inserting minute bars for ${this.symbol}`,
                    e
                );
            }
        }

        if (this.atrFromYdayClose) {
            return;
        }

        const ydaysBars = await getYesterdaysEndingBars(this.symbol, epoch);

        const filteredBars = ydaysBars.filter((b) =>
            isMarketOpen(calendar, b.t)
        );

        const { atr } = getAverageTrueRange(filteredBars);

        const lastAtr = atr[atr.length - 1];

        this.atrFromYdayClose = lastAtr?.value;
    }

    async rebalance(calendar: Calendar[], epoch: number) {
        if (!this.atrFromYdayClose) {
            return;
        }
        const openPositions = await this.broker.getOpenPositions();

        const hasOpenPosition = openPositions.some(
            (p) => p.symbol === this.symbol
        );

        if (!isTimeForBoomBarEntry(epoch) && !hasOpenPosition) {
            return;
        }

        const marketStartEpochToday = getMarketOpenMillis(calendar, epoch);

        const data = await getData(this.symbol, marketStartEpochToday);

        const lastBar = data[0];

        const range = Math.abs(lastBar.h - lastBar.l);

        if (range > 5 * this.atrFromYdayClose) {
            this.isScreened = true;
        } else {
            return;
        }

        const risk = Math.abs(lastBar.h - lastBar.l) / 2;

        const qty = RISK_PER_ORDER / risk;

        const side =
            lastBar.o > lastBar.c ? TradeDirection.sell : TradeDirection.buy;

        const takeProfitLimit =
            side === TradeDirection.buy
                ? lastBar.h + PROFIT_RATIO * risk
                : lastBar.l - PROFIT_RATIO * risk;

        const stop =
            side === TradeDirection.sell ? lastBar.c + risk : lastBar.c - risk;

        const plan: TradePlan = {
            symbol: this.symbol,
            side:
                side === TradeDirection.sell
                    ? PositionDirection.short
                    : PositionDirection.long,
            quantity: qty,
            stop,
            limit_price: -1,
            target: takeProfitLimit,
            entry: -1,
        };
        const unfilledOrder = getBracketOrderForPlan(plan);

        await createOrderSynchronized(plan, unfilledOrder, this.broker);
    }
    async afterEntryTimePassed(epoch: number) {}

    async beforeMarketCloses(epoch: number) {
        if (!this.isInPlay()) {
            return;
        }
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }

    async onMarketClose() {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForBoomBarEntry(epoch);
    }

    isInPlay() {
        return this.isScreened;
    }
}
