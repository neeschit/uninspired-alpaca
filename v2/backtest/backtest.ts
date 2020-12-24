import { AlpacaOrder, AlpacaPosition } from "@neeschit/alpaca-trade-api";
import { currentStreamingSymbols } from "../../src/data/filters";
import { LOGGER } from "../../src/instrumentation/log";
import { Simulator } from "../simulation-helpers";
import { NarrowRangeBarSimulation } from "../strategy/narrowRangeBar.simulation";
import { addBusinessDays } from "date-fns";
import { getSimpleData } from "../../src/resources/stockData";

const startDate = "2020-12-22 09:00:00.000";
const endDate = "2020-12-22 16:30:00.000";

const symbols = currentStreamingSymbols;

jest.mock("../brokerage-helpers", () => {
    class MockBrokerage {
        private orders: AlpacaOrder[] = [];
        private openPositions: AlpacaPosition[] = [];
        private static instance: MockBrokerage;

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

        public static getInstance() {
            if (!MockBrokerage.instance) {
                MockBrokerage.instance = new MockBrokerage();
            }

            return MockBrokerage.instance;
        }
    }
    const mockBroker = MockBrokerage.getInstance();
    const { getCalendar } = jest.requireActual("../brokerage-helpers");

    return {
        getCalendar,
        cancelAlpacaOrder: mockBroker.cancelAlpacaOrder,
        getOpenOrders: mockBroker.getOpenOrders,
        getOpenPositions: mockBroker.getOpenPositions,
        createBracketOrder: mockBroker.createBracketOrder,
        closePosition: mockBroker.closePosition,
    };
});

test("backtester for nrb", async () => {
    const simulator = new Simulator();

    const batches = Simulator.getBatches(startDate, endDate, symbols);

    try {
        await simulator.run(batches, NarrowRangeBarSimulation);
    } catch (e) {
        LOGGER.error(e);
    }
});
