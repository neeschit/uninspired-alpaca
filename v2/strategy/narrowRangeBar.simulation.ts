import { AlpacaOrder } from "@neeschit/alpaca-trade-api";
import { addBusinessDays } from "date-fns";
import { closePosition, getOpenPositions } from "../brokerage-helpers";
import { SimulationStrategy } from "../simulation-helpers/simulation.strategy";
import { getSafeOrbEntryPlan, isTimeForOrbEntry, NarrowRangeBarStrategy } from "./narrowRangeBar";
import {
    cancelOpenOrdersForSymbol,
    getPersistedData,
} from "../trade-management-api/trade-manager.handlers";
import { createOrderSynchronized } from "../trade-management-helpers";
import { PeriodType, DefaultDuration } from "../../src/data/data.model";
import { IndicatorValue } from "../../src/indicator/adx";
import { getAverageTrueRange } from "../../src/indicator/trueRange";
import { LOGGER } from "../../src/instrumentation/log";
import { getPolyonData } from "../../src/resources/polygon";
import { batchInsertDailyBars, getSimpleData } from "../../src/resources/stockData";

export class NarrowRangeBarSimulation implements SimulationStrategy {
    private strategy?: NarrowRangeBarStrategy;
    private tr?: IndicatorValue<number>[];
    private atr?: IndicatorValue<number>[];

    constructor(private symbol: string) {}
    async beforeMarketStarts(epoch = Date.now()): Promise<void> {
        const lastBusinessDay = addBusinessDays(epoch, -1);

        const daysMinutes = await getPolyonData(
            this.symbol,
            lastBusinessDay,
            lastBusinessDay,
            PeriodType.day,
            DefaultDuration.one
        );

        try {
            await batchInsertDailyBars(daysMinutes[this.symbol], this.symbol);
        } catch (e) {
            LOGGER.error(`Error inserting for ${this.symbol}`, e);
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

    async rebalance(epoch: number): Promise<AlpacaOrder | void> {
        if (!this.strategy) {
            await this.beforeMarketStarts(epoch);
        }

        if (!this.strategy) {
            return;
        }

        if (!this.strategy.screenForNarrowRangeBars()) {
            return;
        }

        const positions = await getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        const { data, lastBar } = await getPersistedData(this.symbol, epoch);

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

        if (!plan) {
            return;
        }

        const order = await createOrderSynchronized(plan);
    }
    async afterEntryTimePassed(epoch: number): Promise<void> {
        const positions = await getOpenPositions();

        const hasOpenPosition = positions.some((p) => p.symbol === this.symbol);

        if (hasOpenPosition) {
            return;
        }

        await cancelOpenOrdersForSymbol(this.symbol);
    }
    async tenMinutesToMarketClose(epoch: number): Promise<void> {
        await cancelOpenOrdersForSymbol(this.symbol);
        await closePosition(this.symbol);
    }
    async onMarketClose(): Promise<void> {}

    hasEntryTimePassed(epoch: number) {
        return !isTimeForOrbEntry(epoch);
    }
}
