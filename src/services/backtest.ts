import {
    TradeConfig,
    PositionConfig,
    DefaultDuration,
    SymbolContainingConfig
} from "../data/data.model";
import { EventEmitter } from "events";

export class Backtester {
    private pastTradeConfigs: TradeConfig[] = [];
    private currentPositionConfigs: PositionConfig[] = [];
    private pastPositionConfigs: PositionConfig[] = [];
    private cancelIntervalFn?: NodeJS.Timeout | undefined;

    constructor(private updateInterval: number, private startDate: Date, private endDate: Date) {}

    init() {
        this.cancelIntervalFn = setInterval(() => {
            if (this.cancelIntervalFn) clearInterval(this.cancelIntervalFn);
        }, this.updateInterval);
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
