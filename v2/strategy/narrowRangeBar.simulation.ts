import { AlpacaOrder, Calendar } from "@neeschit/alpaca-trade-api";
import { addBusinessDays } from "date-fns";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import {
    getSafeOrbEntryPlan,
    isTimeForOrbEntry,
    NarrowRangeBarStrategy,
} from "./narrowRangeBar";
import {
    cancelOpenOrdersForSymbol,
    getPersistedData,
} from "../trade-management-api/trade-manager.handlers";
import { createOrderSynchronized } from "../trade-management-helpers/order";
import {
    PeriodType,
    DefaultDuration,
} from "../../libs/core-utils/data/data.model";
import { IndicatorValue } from "../../libs/core-indicators/indicator/adx";
import { getAverageTrueRange } from "../../libs/core-indicators/indicator/trueRange";
import { LOGGER } from "../../libs/core-utils/instrumentation/log";
import { getPolyonData } from "../../libs/core-utils/resources/polygon";
import {
    batchInsertDailyBars,
    getSimpleData,
} from "../../libs/core-utils/resources/stockData";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";

export class NarrowRangeBarSimulation implements SimulationStrategy {
    private strategy?: NarrowRangeBarStrategy;
    private tr?: IndicatorValue<number>[];
    private atr?: IndicatorValue<number>[];

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

        this.strategy = new NarrowRangeBarStrategy({
            symbol: this.symbol,
            bars: data,
            tr,
        });
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

        const positions = await this.broker.getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        const { data, lastBar } = await getPersistedData(
            this.symbol,
            calendar,
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
            dailyAtr: this.atr!.pop()!.value,
        });

        try {
            const order = await createOrderSynchronized(plan, this.broker);
        } catch (e) {
            LOGGER.error(
                `could not place order for ${this.symbol} at ${epoch}`
            );
            throw e;
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
    async beforeMarketCloses(): Promise<void> {
        await cancelOpenOrdersForSymbol(this.symbol, this.broker);
        await this.broker.closePosition(this.symbol);
    }
    async onMarketClose(): Promise<void> {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForOrbEntry(epoch);
    }
}
