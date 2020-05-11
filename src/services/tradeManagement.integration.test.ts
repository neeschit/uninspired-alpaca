import test from "ava";
import { processOrderFromStrategy, rebalancePosition, TradeManagement } from "./tradeManagement";
import {
    TradeType,
    TradeDirection,
    TimeInForce,
    PositionDirection,
    OrderStatus,
} from "../data/data.model";
import { alpaca } from "../resources/alpaca";
import { LOGGER } from "../instrumentation/log";
const symbol = "AAPL";

test("processOrderFromStrategy - simple mapping", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 0,
            type: TradeType.market,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.market,
            side: TradeDirection.buy,
            qty: 100,
            extended_hours: false,
            order_class: "simple",
        }
    );
});

test("processOrderFromStrategy - map stop", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.stop,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.stop,
            side: TradeDirection.buy,
            qty: 100,
            stop_price: 10,
            extended_hours: false,
            order_class: "simple",
        }
    );
});

test("processOrderFromStrategy - map limit", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.limit,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.limit,
            side: TradeDirection.buy,
            qty: 100,
            limit_price: 10,
            extended_hours: false,
            order_class: "simple",
        }
    );
});

test("processOrderFromStrategy - map limit short", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            type: TradeType.limit,
            side: TradeDirection.sell,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
        }),
        {
            symbol,
            time_in_force: TimeInForce.gtc,
            type: TradeType.limit,
            side: TradeDirection.sell,
            qty: 100,
            limit_price: 10,
            extended_hours: false,
            order_class: "simple",
        }
    );
});

test("processOrderFromStrategy - map stop_limit", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            stopPrice: 8,
            type: TradeType.stop_limit,
            side: TradeDirection.buy,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
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
            order_class: "simple",
        }
    );
});

test("processOrderFromStrategy - map stop_limit for shorts", (t) => {
    t.deepEqual(
        processOrderFromStrategy({
            symbol,
            price: 10,
            stopPrice: 11,
            type: TradeType.stop_limit,
            side: TradeDirection.sell,
            tif: TimeInForce.gtc,
            quantity: 100,
            t: 0,
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
            order_class: "simple",
        }
    );
});

test("rebalancePosition - simple stop", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06,
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            quantity: 200,
            side: PositionDirection.long,
            originalQuantity: 200,
            averageEntryPrice: orderDefinition.averagePrice,
        },
        {
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 200,
        side: TradeDirection.sell,
        t: order!.t,
    });
});

test("rebalancePosition - simple stop for a short", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 189.96,
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 190,
            plannedStopPrice: 200,
            quantity: 200,
            side: PositionDirection.short,
            originalQuantity: 200,
            averageEntryPrice: orderDefinition.averagePrice,
        },
        {
            c: 200.01,
            h: 201,
            l: 199.3,
            v: 30000,
            o: 199.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 200,
        side: TradeDirection.buy,
        t: order!.t,
    });
});

test("rebalancePosition - nothing to do for a short", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 189.96,
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 190,
            plannedStopPrice: 200,
            quantity: 200,
            side: PositionDirection.short,
            originalQuantity: 200,
        },
        {
            c: 199.01,
            h: 199.7,
            l: 198.3,
            v: 30000,
            o: 199.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, null);
});

test("rebalancePosition - simple partial", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06,
    };
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            quantity: 200,
            side: PositionDirection.long,
            originalQuantity: 200,
            averageEntryPrice: orderDefinition.averagePrice,
        },
        {
            c: 209.5,
            h: 210,
            l: 209.3,
            v: 30000,
            o: 209.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 200,
        side: TradeDirection.sell,
        t: order!.t,
    });
});

test("rebalancePosition - simple partial for a short", async (t) => {
    const orderDefinition = {
        filledQuantity: 5,
        symbol,
        averagePrice: 25.489154629747794,
        status: OrderStatus.filled,
    };

    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 25,
            plannedStopPrice: 27,
            quantity: 5,
            side: PositionDirection.short,
            originalQuantity: 5,
            averageEntryPrice: orderDefinition.averagePrice,
        },
        {
            c: 27.5,
            h: 28,
            l: 26.3,
            v: 30000,
            o: 26.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 5,
        side: TradeDirection.buy,
        t: order!.t,
    });
});

test("rebalancePosition - close position after partial", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.filled,
        filledQuantity: 200,
        averagePrice: 200.06,
    };
    const order = await rebalancePosition(
        {
            symbol,
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            quantity: 50,
            side: PositionDirection.long,
            originalQuantity: 200,
            averageEntryPrice: orderDefinition.averagePrice,
        },
        {
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: 0,
        },
        0.9
    );

    t.deepEqual(order, {
        symbol,
        price: 0,
        tif: TimeInForce.gtc,
        type: TradeType.market,
        quantity: 50,
        side: TradeDirection.sell,
        t: order!.t,
    });
});

test("trade management - init and recordOnceUpdateReceived", async (t) => {
    const orderDefinition = {
        symbol,
        status: OrderStatus.partial_fill,
        filledQuantity: 150,
        averagePrice: 200.06,
    };
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop_limit,
            tif: TimeInForce.day,
            stopPrice: 200,
            price: 200.05,
            quantity: 200,
            t: Date.now(),
        },
        {
            plannedEntryPrice: 200,
            riskAtrRatio: 1,
            plannedStopPrice: 190,
            symbol,
            quantity: 200,
            side: PositionDirection.long,
        },
        0.9
    );

    const filledPositionConfig = await manager.recordTradeOnceFilled({
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
        extended_hours: false,
    });

    const position = await manager.getPosition();

    t.deepEqual(filledPositionConfig, {
        averageEntryPrice: 200.06,
        id: position.id,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        originalQuantity: 150,
        riskAtrRatio: 1,
        side: PositionDirection.long,
        quantity: 150,
        trades: [
            {
                averagePrice: 200.06,
                filledQuantity: 150,
                price: 200,
                quantity: 150,
                side: TradeDirection.buy,
                status: OrderStatus.partial_fill,
                symbol: "AAPL",
                t: filledPositionConfig.trades[0].t,
                tif: TimeInForce.day,
                type: TradeType.stop,
            },
        ],
    });
});

test("trade management - handle trade update - empty fill", async (t) => {
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop,
            tif: TimeInForce.gtc,
            price: 200,
            quantity: 200,
            t: Date.now(),
        },
        {
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            symbol,
            riskAtrRatio: 1,
            quantity: 200,
            side: PositionDirection.long,
        },
        0.9
    );

    manager.position = {
        id: 1,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        riskAtrRatio: 1,
        originalQuantity: 150,
        side: PositionDirection.long,
        quantity: 150,
    };

    manager.filledPosition = Object.assign(
        {
            trades: [
                {
                    symbol,
                    status: OrderStatus.partial_fill,
                    averagePrice: 200.06,
                    filledQuantity: 0,
                    ...manager.config,
                },
            ],
        },
        manager.position
    );

    t.is(
        undefined,
        await manager.onTickUpdate({
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: Date.now(),
        })
    );
});

test("trade management - handle trade update - non empty fill", (t) => {
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop,
            tif: TimeInForce.gtc,
            price: 200,
            quantity: 200,
            t: Date.now(),
        },
        {
            plannedEntryPrice: 200,
            plannedStopPrice: 190,
            riskAtrRatio: 1,
            symbol,
            quantity: 200,
            side: PositionDirection.long,
        },
        0.9
    );

    manager.position = {
        id: 1,
        symbol,
        plannedStopPrice: 190,
        plannedEntryPrice: 200,
        riskAtrRatio: 1,
        originalQuantity: 150,
        side: PositionDirection.long,
        quantity: 150,
    };

    manager.filledPosition = Object.assign(
        {
            trades: [
                {
                    status: OrderStatus.partial_fill,
                    averagePrice: 200.06,
                    filledQuantity: 10,
                    ...manager.config,
                },
            ],
        },
        manager.position
    );

    t.truthy(
        manager.onTickUpdate({
            c: 189.91,
            h: 191,
            l: 189.3,
            v: 30000,
            o: 190.4,
            t: Date.now(),
        })
    );
});

test.cb("queue & cancel trade", (t) => {
    const manager = new TradeManagement(
        {
            symbol,
            side: TradeDirection.buy,
            type: TradeType.stop_limit,
            tif: TimeInForce.day,
            price: 300.05,
            stopPrice: 300,
            quantity: 300,
            t: Date.now(),
        },
        {
            plannedEntryPrice: 300,
            riskAtrRatio: 1,
            plannedStopPrice: 290,
            symbol,
            quantity: 100,
            side: PositionDirection.long,
        },
        0.9
    );

    manager
        .queueEntry()
        .then((trade) => t.truthy(trade!.id))
        .then(() => {
            return manager.cancelPendingTrades();
        })
        .then(() => {
            setTimeout(async () => {
                const orders = await alpaca.getOrders({
                    status: "open",
                });

                LOGGER.info(orders);

                t.falsy(orders.length);

                t.end();
            }, 100);
        });
});
