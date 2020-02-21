import test from "ava";
import { processOrderFromStrategy, rebalancePosition } from "./tradeManagement.service";
import { TradeType, TimeInForce, TradeDirection, PositionDirection } from "../data/data.model";
const symbol = "AAPL";

test("processOrderFromStrategy - simple mapping", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 0,
            type: TradeType.market,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.market,
            side: TradeDirection.buy,
            qty: 100,
            limit_price: 0,
            stop_price: 0,
            extended_hours: false,
            order_class: "simple"
        }
    );
});

test("processOrderFromStrategy - map stop", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.stop,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.stop,
            side: TradeDirection.buy,
            qty: 100,
            limit_price: 0,
            stop_price: 10,
            extended_hours: false,
            order_class: "simple"
        }
    );
});

test("processOrderFromStrategy - map limit", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.limit,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.limit,
            side: TradeDirection.buy,
            qty: 100,
            limit_price: 10,
            stop_price: 0,
            extended_hours: false,
            order_class: "simple"
        }
    );
});

test("processOrderFromStrategy - map stop_limit", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            stopPrice: 8,
            type: TradeType.stop_limit,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.stop_limit,
            side: TradeDirection.buy,
            qty: 100,
            limit_price: 10,
            stop_price: 8,
            extended_hours: false,
            order_class: "simple"
        }
    );
});

test("rebalancePosition - simple stop", async t => {
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            averageEntryPrice: 200.06,
            quantity: 200,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200
        },
        {
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: 0
        }
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 200,
        side: TradeDirection.sell
    });
});

test("rebalancePosition - simple partial", async t => {
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            averageEntryPrice: 200.06,
            quantity: 200,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200
        },
        {
            c: 209.5,
            h: 210,
            l: 209.3,
            v: 30000,
            o: 209.4,
            t: 0
        }
    );

    t.deepEqual(order, {
        symbol,
        price: 209.5,
        tif: TimeInForce.day,
        type: TradeType.limit,
        quantity: 150,
        side: TradeDirection.sell
    });
});

test("rebalancePosition - close position after partial", async t => {
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            averageEntryPrice: 200.06,
            quantity: 50,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200
        },
        {
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: 0
        }
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 50,
        side: TradeDirection.sell
    });
});
