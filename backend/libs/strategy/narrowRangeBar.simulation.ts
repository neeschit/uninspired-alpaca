import { AlpacaOrder, Calendar } from "@neeschit/alpaca-trade-api";
import { addBusinessDays, formatISO } from "date-fns";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
    NarrowRangeBarStrategy,
} from "./narrowRangeBar";
import {
    createOrderSynchronized,
    cancelOpenOrdersForSymbol,
} from "../trade-management-helpers/order";
import { PeriodType, DefaultDuration } from "../core-utils/data/data.model";
import { IndicatorValue } from "../core-indicators/indicator/adx";
import { getAverageTrueRange } from "../core-indicators/indicator/trueRange";
import { LOGGER } from "../core-utils/instrumentation/log";
import { getPolyonData } from "../core-utils/resources/polygon";
import {
    batchInsertDailyBars,
    getSimpleData,
    getPersistedData,
} from "../core-utils/resources/stockData";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { getMarketOpenMillis } from "../simulation-helpers/timing.util";

export class NarrowRangeBarSimulation implements SimulationStrategy {
    private strategy?: NarrowRangeBarStrategy;
    private tr?: IndicatorValue<number>[];
    private atr?: IndicatorValue<number>[];
    private isInPlayCurrently = false;

    constructor(private symbol: string, private broker: BrokerStrategy) {}
    async beforeMarketStarts(epoch = Date.now()): Promise<void> {
        const startBusinessDay = addBusinessDays(epoch, -10);
        const lastBusinessDay = addBusinessDays(epoch, -1);

        if (process.env.NODE_ENV !== "backtest") {
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
                LOGGER.error(`Error inserting for ${this.symbol}`, e);
            }
        }

        const data = await getSimpleData(
            this.symbol,
            addBusinessDays(epoch, -18).getTime(),
            false,
            lastBusinessDay.getTime()
        );

        const { tr, atr } = getAverageTrueRange(data, false);

        this.tr = tr;
        this.atr = atr;

        if (!this.atr || !this.atr.length) {
            throw new Error(
                `Should have found some atr for ${
                    this.symbol
                } on the next day after ${formatISO(lastBusinessDay)}`
            );
        }

        this.strategy = new NarrowRangeBarStrategy({
            symbol: this.symbol,
            bars: data,
            tr,
        });
    }

    isInPlay() {
        return this.isInPlayCurrently;
    }

    async rebalance(
        calendar: Calendar[],
        epoch: number
    ): Promise<AlpacaOrder | void> {
        if (!this.strategy) {
            await this.beforeMarketStarts(epoch);
        }

        if (!this.strategy!.screenForNarrowRangeBars()) {
            return;
        }

        this.isInPlayCurrently = true;

        const positions = await this.broker.getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        const marketOpenMillis = getMarketOpenMillis(calendar, epoch);

        const { data, lastBar } = await getPersistedData(
            this.symbol,
            marketOpenMillis,
            epoch
        );

        const { atr } = getAverageTrueRange(data, false);

        const currentAtr = atr!.pop()!.value;

        const plan = getSafeOrbEntryPlan({
            currentAtr,
            marketBarsSoFar: data,
            symbol: this.symbol,
            lastPrice: lastBar.c,
            openingBar: data[0],
            dailyAtr: this.atr![this.atr!.length - 1].value,
        });

        try {
            const order = await createOrderSynchronized(plan, this.broker);
        } catch (e) {
            if (
                e.message.indexOf("order_exists") === -1 &&
                e.message.indexOf("order_placed_recently_for_symbol") === -1
            ) {
                LOGGER.error(
                    `could not place order ${e.message} for ${this.symbol} at ${epoch}`
                );
                throw e;
            }
        }
    }
    async afterEntryTimePassed(): Promise<void> {
        const positions = await this.broker.getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
    }
    async beforeMarketCloses(epoch: number): Promise<void> {
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol, epoch);
    }
    async onMarketClose(): Promise<void> {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForOrbEntry(epoch);
    }
}
