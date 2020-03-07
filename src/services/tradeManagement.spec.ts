import test from "ava";
import { processOrderFromStrategy, rebalancePosition, TradeManagement } from "./tradeManagement";
import {
    TradeType,
    TradeDirection,
    TimeInForce,
    PositionDirection,
    OrderStatus
} from "../data/data.model";
const symbol = "AAPL";

test("processOrderFromStrategy - simple mapping", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 0,
            type: TradeType.market,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0
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
            quantity: 100,
            t: 0
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
            quantity: 100,
            t: 0
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

test("processOrderFromStrategy - map limit short", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.limit,
            side: TradeDirection.sell,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.limit,
            side: TradeDirection.sell,
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
            quantity: 100,
            t: 0
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

test("processOrderFromStrategy - map stop_limit for shorts", t => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            stopPrice: 11,
            type: TradeType.stop_limit,
            side: TradeDirection.sell,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.stop_limit,
            side: TradeDirection.sell,
            qty: 100,
            limit_price: 10,
            stop_price: 11,
            extended_hours: false,
            order_class: "simple"
        }
    );
});

test("rebalancePosition - simple stop", async t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            quantity: 200,
            plannedQuantity: 200,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 200,
                    quantity: 200,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
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
        side: TradeDirection.sell,
        t: order!.t
    });
});

test("rebalancePosition - simple stop for a short", async t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 189.96
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 190,
            plannedStopPrice: 200,
            plannedRiskUnits: 10,
            quantity: 200,
            plannedQuantity: 200,
            hasHardStop: true,
            side: PositionDirection.short,
            originalQuantity: 200,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 190,
                    quantity: 200,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
        },
        {
            c: 200.01,
            h: 201,
            l: 199.3,
            v: 30000,
            o: 199.4,
            t: 0
        }
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 200,
        side: TradeDirection.buy,
        t: order!.t
    });
});

test("rebalancePosition - nothing to do for a short", async t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 189.96
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 190,
            plannedStopPrice: 200,
            plannedRiskUnits: 10,
            quantity: 200,
            plannedQuantity: 200,
            hasHardStop: true,
            side: PositionDirection.short,
            originalQuantity: 200,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 190,
                    quantity: 200,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
        },
        {
            c: 199.01,
            h: 199.7,
            l: 198.3,
            v: 30000,
            o: 199.4,
            t: 0
        }
    );

    t.deepEqual(order, null);
});

test("rebalancePosition - simple partial", async t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06
    };
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            plannedQuantity: 200,
            quantity: 200,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 200,
                    quantity: 200,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
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
        side: TradeDirection.sell,
        t: order!.t
    });
});

test("rebalancePosition - simple partial for a short", async t => {
    const orderDefinition = {
        filledQuantity: 5,
        symbol,
        averagePrice: 25.489154629747794,
        status: OrderStatus.filled
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 25,
            plannedStopPrice: 27,
            plannedQuantity: 5,
            plannedRiskUnits: 10,
            quantity: 5,
            hasHardStop: true,
            side: PositionDirection.short,
            originalQuantity: 5,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 25.5,
                    quantity: 5,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
        },
        {
            c: 27.5,
            h: 28,
            l: 26.3,
            v: 30000,
            o: 26.4,
            t: 0
        }
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 5,
        side: TradeDirection.buy,
        t: order!.t
    });
});

test("rebalancePosition - close position after partial", async t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06
    };
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedRiskUnits: 10,
            plannedQuantity: 200,
            quantity: 50,
            hasHardStop: true,
            side: PositionDirection.long,
            originalQuantity: 200,
            order: orderDefinition,
            trades: [
                {
                    order: orderDefinition,
                    tif: TimeInForce.day,
                    price: 200,
                    quantity: 200,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    t: Date.now(),
                    symbol
                }
            ]
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
        side: TradeDirection.sell,
        t: order!.t
    });
});

test("trade management - init and recordOnceUpdateReceived", t => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.partial_fill,
        filledQuantity: 150,
        averagePrice: 200.06
    };
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop,
            tif: TimeInForce.day,
            price: 200,
            quantity: 200,
            t: Date.now()
        },
        {
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedQuantity: 200,
            symbol,
            quantity: 200,
            side: PositionDirection.long
        }
    );

    const filledPositionConfig = manager.recordTradeOnceFilled({
        symbol,
        status: OrderStatus.partial_fill,
        id: "904837e3-3b76-47ec-b432-046db621571b",
        client_order_id: "904837e3-3b76-47ec-b432-046db621571b",
        created_at: "2018-10-05T05:48:59Z",
        updated_at: "2018-10-05T05:48:59Z",
        submitted_at: "2018-10-05T05:48:59Z",
        filled_at: "2018-10-05T05:48:59Z",
        expired_at: "2018-10-05T05:48:59Z",
        canceled_at: "2018-10-05T05:48:59Z",
        failed_at: "2018-10-05T05:48:59Z",
        asset_id: "904837e3-3b76-47ec-b432-046db621571b",
        asset_class: "us_equity",
        qty: 15,
        filled_qty: 150,
        type: TradeType.market,
        side: TradeDirection.buy,
        time_in_force: TimeInForce.day,
        limit_price: 200,
        stop_price: 190,
        filled_avg_price: 200.06,
        extended_hours: false
    });

    t.deepEqual(filledPositionConfig, {
        hasHardStop: false,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        plannedRiskUnits: 10,
        originalQuantity: 150,
        plannedQuantity: 200,
        side: PositionDirection.long,
        quantity: 150,
        order: orderDefinition,
        trades: [
            {
                order: orderDefinition,
                tif: TimeInForce.day,
                price: 200,
                quantity: 150,
                side: TradeDirection.buy,
                type: TradeType.stop,
                t: filledPositionConfig.trades[0].t,
                symbol
            }
        ]
    });
});

test("trade management - handle trade update - empty fill", t => {
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop,
            tif: TimeInForce.gtc,
            price: 200,
            quantity: 200,
            t: Date.now()
        },
        {
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedQuantity: 200,
            symbol,
            quantity: 200,
            side: PositionDirection.long
        }
    );

    manager.position = {
        hasHardStop: false,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        plannedRiskUnits: 10,
        originalQuantity: 150,
        plannedQuantity: 200,
        side: PositionDirection.long,
        quantity: 150
    };

    manager.order = {
        symbol,
        status: OrderStatus.partial_fill,
        averagePrice: 200.06,
        filledQuantity: 0
    };

    t.is(
        undefined,
        manager.onTradeUpdate({
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: Date.now()
        })
    );
});

test("trade management - handle trade update - non empty fill", t => {
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop,
            tif: TimeInForce.gtc,
            price: 200,
            quantity: 200,
            t: Date.now()
        },
        {
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            plannedQuantity: 200,
            symbol,
            quantity: 200,
            side: PositionDirection.long
        }
    );

    manager.position = {
        hasHardStop: false,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        plannedRiskUnits: 10,
        originalQuantity: 150,
        plannedQuantity: 200,
        side: PositionDirection.long,
        quantity: 150
    };

    manager.order = {
        symbol,
        status: OrderStatus.partial_fill,
        averagePrice: 200.06,
        filledQuantity: 10
    };

    t.truthy(
        manager.onTradeUpdate({
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: Date.now()
        })
    );
});