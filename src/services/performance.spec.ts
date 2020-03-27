import test from "ava";
import {
    FilledPositionConfig,
    OrderStatus,
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce
} from "../data/data.model";
import { analyzeClosedPositions, getDetailedPerformanceReport } from "./performance";
import perfReport from "../fixtures/perfReport";

test.skip("assess performance at a deeper level", t => {
    const insight = getDetailedPerformanceReport(perfReport);

    t.is(5, insight.monthly.length);

    /* t.deepEqual(insight.monthly, [
        { profit: 102.05014937739405, longs: 113, shorts: 45, winners: 87, total: 158 },
        { profit: 50.94668223219146, longs: 28, shorts: 13, total: 41, winners: 16 },
        { profit: 313.0047939610212, longs: 10, shorts: 18, total: 28, winners: 18 },
        { profit: 228.75189631903174, longs: 2, shorts: 32, total: 34, winners: 23 },
        { profit: 447.10344784745257, longs: 0, shorts: 28, total: 28, winners: 26 }
    ]); */
});

test("successful long trade report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "ABMD",
            originalQuantity: 1,
            hasHardStop: false,
            plannedEntryPrice: 218,
            plannedStopPrice: 210,
            plannedQuantity: 1,
            plannedRiskUnits: 7.5,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "ABMD",
                    quantity: 1,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 217.5,
                    t: 1573137360000,
                    filledQuantity: 1,
                    averagePrice: 217.59565608986355,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 224.76377395381638,
                    status: OrderStatus.filled,
                    price: 224.81,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 1,
                    t: 1573573320000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);
    t.truthy(performance);
    t.is(Math.round(performance.profit), 7);
});

test("successful long trade with partial report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "ABMD",
            originalQuantity: 5,
            hasHardStop: false,
            plannedEntryPrice: 218,
            plannedStopPrice: 210,
            plannedQuantity: 5,
            plannedRiskUnits: 7.5,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "ABMD",
                    quantity: 5,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 217.5,
                    t: 1573137360000,
                    filledQuantity: 5,
                    averagePrice: 217.59565608986355,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 4,
                    symbol: "ABMD",
                    averagePrice: 224.76377395381638,
                    status: OrderStatus.filled,
                    price: 224.81,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 4,
                    t: 1573573320000
                },
                {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 224.76377395381638,
                    status: OrderStatus.filled,
                    price: 224.81,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 1,
                    t: 1573578320000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);

    t.truthy(performance);
    t.is(Math.round(performance.profit), 36);
});

test("successful long trade with failed partial report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "ABMD",
            originalQuantity: 5,
            hasHardStop: false,
            plannedEntryPrice: 218,
            plannedStopPrice: 210,
            plannedQuantity: 5,
            plannedRiskUnits: 7.5,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "ABMD",
                    quantity: 5,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 217.5,
                    t: 1573137360000,
                    filledQuantity: 5,
                    averagePrice: 217.59565608986355,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 4,
                    symbol: "ABMD",
                    averagePrice: 224.76377395381638,
                    status: OrderStatus.filled,
                    price: 224.81,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 4,
                    t: 1573573320000
                },
                {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 214.46377395381638,
                    status: OrderStatus.filled,
                    price: 0,
                    type: TradeType.market,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 1,
                    t: 1573578320000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);

    t.truthy(performance);
    t.is(Math.round(performance.profit), 26);
});

test("unsuccessful long trade report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "ABMD",
            originalQuantity: 1,
            hasHardStop: false,
            plannedEntryPrice: 218,
            plannedStopPrice: 215,
            plannedQuantity: 1,
            plannedRiskUnits: 3.5,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "ABMD",
                    quantity: 1,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 217.5,
                    t: 1573137360000,
                    filledQuantity: 1,
                    averagePrice: 217.59565608986355,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 214.76377395381638,
                    status: OrderStatus.filled,
                    price: 214.81,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 1,
                    t: 1573573320000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);

    t.truthy(performance);
    t.is(Math.round(performance.profit), -3);
});

test("successful short trade report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "CVS",
            originalQuantity: 3,
            hasHardStop: false,
            plannedEntryPrice: 58,
            plannedStopPrice: 61,
            plannedQuantity: 3,
            plannedRiskUnits: 3,
            side: PositionDirection.short,
            quantity: 0,
            trades: [
                {
                    symbol: "CVS",
                    quantity: 3,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 58,
                    t: 1551710160000,
                    filledQuantity: 3,
                    averagePrice: 57.93321995517123,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 3,
                    symbol: "CVS",
                    averagePrice: 55.24869019424767,
                    status: OrderStatus.filled,
                    price: 55.21,
                    type: TradeType.limit,
                    side: TradeDirection.buy,
                    tif: TimeInForce.day,
                    quantity: 3,
                    t: 1553521980000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);

    t.truthy(performance);
    t.is(Math.round(performance.profit), 8);
});

test("unsuccessful short trade report", t => {
    const position: FilledPositionConfig[] = [
        {
            symbol: "EIX",
            originalQuantity: 5,
            hasHardStop: false,
            plannedEntryPrice: 66,
            plannedStopPrice: 68,
            plannedQuantity: 5,
            plannedRiskUnits: 2,
            side: PositionDirection.short,
            quantity: 0,
            trades: [
                {
                    symbol: "EIX",
                    quantity: 5,
                    side: TradeDirection.sell,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 66,
                    t: 1573050960000,
                    filledQuantity: 5,
                    averagePrice: 65.93375230001038,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 5,
                    symbol: "EIX",
                    averagePrice: 68.12928697299374,
                    status: OrderStatus.filled,
                    price: 0,
                    type: TradeType.market,
                    side: TradeDirection.buy,
                    tif: TimeInForce.gtc,
                    quantity: 5,
                    t: 1573661100000
                }
            ]
        }
    ];

    const performance = analyzeClosedPositions(position);

    t.truthy(performance);
    t.is(Math.round(performance.profit), -11);
});

test("successful list of 8 positions", t => {
    const positions: FilledPositionConfig[] = [
        {
            symbol: "HON",
            originalQuantity: 6,
            hasHardStop: false,
            plannedEntryPrice: 154.5,
            plannedStopPrice: 153,
            plannedQuantity: 6,
            plannedRiskUnits: 2,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "HON",
                    quantity: 6,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 155,
                    t: 1551450960000,
                    filledQuantity: 6,
                    averagePrice: 155.077487821752,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 5,
                    symbol: "HON",
                    averagePrice: 156.61348740109216,
                    status: OrderStatus.filled,
                    price: 156.63,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 5,
                    t: 1551709860000
                },
                {
                    filledQuantity: 1,
                    symbol: "HON",
                    averagePrice: 152.9200104946864,
                    status: OrderStatus.filled,
                    price: 0,
                    type: TradeType.market,
                    side: TradeDirection.sell,
                    tif: TimeInForce.gtc,
                    quantity: 1,
                    t: 1551969660000
                }
            ]
        },
        {
            symbol: "ECL",
            originalQuantity: 4,
            hasHardStop: false,
            plannedEntryPrice: 169.5,
            plannedStopPrice: 167,
            plannedQuantity: 4,
            plannedRiskUnits: 3,
            side: PositionDirection.long,
            quantity: 0,
            trades: [
                {
                    symbol: "ECL",
                    quantity: 4,
                    side: TradeDirection.buy,
                    type: TradeType.stop,
                    tif: TimeInForce.day,
                    price: 170,
                    t: 1551450960000,
                    filledQuantity: 4,
                    averagePrice: 170.0411909780172,
                    status: OrderStatus.filled
                },
                {
                    filledQuantity: 3,
                    symbol: "ECL",
                    averagePrice: 172.35842779921867,
                    status: OrderStatus.filled,
                    price: 172.39,
                    type: TradeType.limit,
                    side: TradeDirection.sell,
                    tif: TimeInForce.day,
                    quantity: 3,
                    t: 1552483860000
                },
                {
                    filledQuantity: 1,
                    symbol: "ECL",
                    averagePrice: 175.14075813423278,
                    status: OrderStatus.filled,
                    price: 0,
                    type: TradeType.market,
                    side: TradeDirection.sell,
                    tif: TimeInForce.gtc,
                    quantity: 1,
                    t: 1552938180000
                }
            ]
        }
    ];
    const performance = analyzeClosedPositions(positions);

    t.is(Math.round(performance.profit), 18);
});
