import test from "ava";

import {
    checkIfPositionsNeedRefreshing,
    handlePositionOrderUpdate,
    handleOrderReplacement,
    handlePositionOrderReplacement,
} from "./manager.handlers";
import {
    SimpleAlpacaPosition,
    AlpacaOrder,
    TradeDirection,
    PositionDirection,
    TradeType,
    TimeInForce,
} from "@neeschit/alpaca-trade-api";
import { TradeConfig, TradePlan } from "../data/data.model";
import { TradeManagement } from "../services/tradeManagement";

test("positions out of sync in db are identfied", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {
        test: {
            symbol: "test",
            avg_entry_price: "15",
            qty: "10",
        },
    };

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 0,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});

test("positions out of sync in db on quantity alone are identified", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {
        test: {
            symbol: "test",
            avg_entry_price: "15",
            qty: "10",
        },
    };

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 15,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});

test("non-existent positions need to be reset", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {};

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 15,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});

test.cb("should result in only one order", (t) => {
    const manager = ({
        queueTrade: () => Promise.resolve(true),
    } as any) as TradeManagement;

    const config = ({
        symbol: "test",
        side: TradeDirection.buy,
        qty: 100,
        type: TradeType.market,
    } as any) as TradeConfig;

    const promises: Promise<AlpacaOrder | null>[] = [];

    promises.push(handlePositionOrderUpdate(config, "test", manager));

    setTimeout(async () => {
        promises.push(handlePositionOrderUpdate(config, "test", manager));

        const results = await Promise.all(promises);

        t.truthy(results.length);
        t.truthy(results.some((r) => !r));

        t.end();
    }, 0);
});

test.cb("should result in only one replacement order", (t) => {
    const manager = ({
        queueTrade: () => Promise.resolve(true),
    } as any) as TradeManagement;

    const config: { plan: TradePlan; config: TradeConfig } = {
        plan: {
            plannedEntryPrice: 200,
            plannedStopPrice: 195,
            quantity: 100,
            symbol: "test",
            riskAtrRatio: 1,
            side: PositionDirection.long,
        },
        config: ({
            tif: TimeInForce.gtc,
        } as any) as TradeConfig,
    };

    const order = ({
        id: 1,
    } as any) as AlpacaOrder;

    const promises: Promise<AlpacaOrder | null>[] = [];

    promises.push(handlePositionOrderReplacement(config, "test", order, manager));

    setTimeout(async () => {
        promises.push(handlePositionOrderReplacement(config, "test", order, manager));

        const results = await Promise.all(promises);

        t.truthy(results.length);
        t.truthy(
            results.some((r) => !r),
            "expected only one item to be true"
        );

        t.end();
    }, 0);
});

test.cb("should result in only one replacement order even with a delayed response", (t) => {
    const manager = ({
        queueTrade: () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 40);
            });
        },
    } as any) as TradeManagement;

    const config: { plan: TradePlan; config: TradeConfig } = {
        plan: {
            plannedEntryPrice: 200,
            plannedStopPrice: 195,
            quantity: 100,
            symbol: "test",
            riskAtrRatio: 1,
            side: PositionDirection.long,
        },
        config: ({
            tif: TimeInForce.gtc,
        } as any) as TradeConfig,
    };

    const order = ({
        id: 1,
    } as any) as AlpacaOrder;

    const promises: Promise<AlpacaOrder | null>[] = [];

    promises.push(handlePositionOrderReplacement(config, "test", order, manager));

    setTimeout(async () => {
        promises.push(handlePositionOrderReplacement(config, "test", order, manager));

        const results = await Promise.all(promises);

        t.truthy(results.length);
        t.truthy(
            results.some((r) => !r),
            "expected only one item to be true"
        );

        t.end();
    }, 0);
});
