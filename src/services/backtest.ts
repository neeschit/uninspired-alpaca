import { TradeConfig, PositionConfig, SymbolContainingConfig } from "../data/data.model";
import { EventEmitter } from "events";
import { isBefore, isAfter, addMilliseconds, isEqual } from "date-fns";
import { isMarketOpen } from "../util/market";

export class Backtester {
    private pastTradeConfigs: TradeConfig[] = [];
    private currentPositionConfigs: PositionConfig[] = [];
    private pastPositionConfigs: PositionConfig[] = [];
    private cancelIntervalFn?: NodeJS.Timeout | undefined;
    private currentDate: Date;

    constructor(
        private updateIntervalMillis: number,
        private startDate: Date,
        private endDate: Date
    ) {
        this.currentDate = startDate;
    }

    init(clock: any) {
        this.cancelIntervalFn = setInterval(() => {
            if (isMarketOpen(this.currentDate)) this.tradeUpdater.emit("interval hit");

            this.currentDate = addMilliseconds(this.currentDate, this.updateIntervalMillis);

            if (
                isAfter(this.currentDate, this.endDate) ||
                isEqual(this.currentDate, this.endDate)
            ) {
                if (this.cancelIntervalFn) clearInterval(this.cancelIntervalFn);
            }
        }, this.updateIntervalMillis);
    }

    public tradeUpdater: EventEmitter = new EventEmitter();

    recordOrderRequest(tradeConfig: TradeConfig) {
        if (!tradeConfig.quantity && !tradeConfig) {
            this.addToArray(tradeConfig, this.pastTradeConfigs);
        }
    }

    recordPositionUpdate(positionConfig: PositionConfig) {
        if (!positionConfig.quantity) {
            this.addToArray(positionConfig, this.pastPositionConfigs);
            return;
        }

        this.addToArray(positionConfig, this.currentPositionConfigs);
    }

    private addToArray<X extends SymbolContainingConfig>(item: X, array: X[]) {
        const index = array.findIndex(val => val.symbol);

        if (!index) {
            array.push(item);
        } else {
            array[index] = item;
        }
    }
}
