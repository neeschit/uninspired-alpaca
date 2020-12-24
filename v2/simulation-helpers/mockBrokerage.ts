import { AlpacaOrder, AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { EventEmitter } from "events";

const eventEmitter = new EventEmitter();

export class MockBrokerage {
    private orders: AlpacaOrder[] = [];
    private openPositions: AlpacaPosition[] = [];
    private static instance: MockBrokerage;
    private epoch = Date.now();

    private constructor() {}

    public async cancelAlpacaOrder() {}

    public async getOpenOrders() {
        return [];
    }

    public async getOpenPositions() {
        return [];
    }

    public async createBracketOrder() {
        return {
            id: Date.now(),
        };
    }

    public async closePosition() {}

    public tick(epoch: number) {
        this.epoch = epoch;
        // check open orders
    }

    public static getInstance() {
        if (!MockBrokerage.instance) {
            MockBrokerage.instance = new MockBrokerage();
        }

        return MockBrokerage.instance;
    }
}
