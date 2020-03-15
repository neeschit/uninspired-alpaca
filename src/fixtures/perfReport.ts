import {
    PositionDirection,
    OrderStatus,
    TradeDirection,
    TradeType,
    TimeInForce
} from "../data/data.model";

export default [
    {
        symbol: "LVS",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 64,
        plannedStopPrice: 63,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "LVS",
            averagePrice: 64.5090868915944,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LVS",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 64.5,
                t: 1572964560000,
                order: {
                    filledQuantity: 10,
                    symbol: "LVS",
                    averagePrice: 64.5090868915944,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "LVS",
                    averagePrice: 63.049665485470136,
                    status: OrderStatus.filled
                },
                symbol: "LVS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573059000000
            }
        ]
    },
    {
        symbol: "PGR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 69,
        plannedStopPrice: 70,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "PGR",
            averagePrice: 68.90272520994048,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PGR",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 69,
                t: 1573050960000,
                order: {
                    filledQuantity: 10,
                    symbol: "PGR",
                    averagePrice: 68.90272520994048,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "PGR",
                    averagePrice: 70.0344491812124,
                    status: OrderStatus.filled
                },
                symbol: "PGR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573066800000
            }
        ]
    },
    {
        symbol: "UTX",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 149.5,
        plannedStopPrice: 148,
        plannedQuantity: 6,
        plannedRiskUnits: 0,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "UTX",
            averagePrice: 148.0148967705658,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "UTX",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 148,
                t: 1573223760000,
                order: {
                    filledQuantity: 6,
                    symbol: "UTX",
                    averagePrice: 148.0148967705658,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "UTX",
                    averagePrice: 147.97093885272682,
                    status: OrderStatus.filled
                },
                symbol: "UTX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573223820000
            }
        ]
    },
    {
        symbol: "LVS",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 64.5,
        plannedStopPrice: 63,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LVS",
            averagePrice: 64.03310325359932,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LVS",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 64,
                t: 1573223760000,
                order: {
                    filledQuantity: 6,
                    symbol: "LVS",
                    averagePrice: 64.03310325359932,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "LVS",
                    averagePrice: 63.05842251361969,
                    status: OrderStatus.filled
                },
                symbol: "LVS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573483200000
            }
        ]
    },
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
        order: {
            filledQuantity: 1,
            symbol: "ABMD",
            averagePrice: 217.58916942899708,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ABMD",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 217.5,
                t: 1573137360000,
                order: {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 217.58916942899708,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ABMD",
                    averagePrice: 224.7302763937304,
                    status: OrderStatus.filled
                },
                symbol: "ABMD",
                price: 224.81,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573573320000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 73.5,
        plannedStopPrice: 72,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "STT",
            averagePrice: 73.09591900600596,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 73,
                t: 1573569360000,
                order: {
                    filledQuantity: 6,
                    symbol: "STT",
                    averagePrice: 73.09591900600596,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "STT",
                    averagePrice: 71.9967160732155,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "AMP",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 160,
        plannedStopPrice: 157,
        plannedQuantity: 3,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "AMP",
            averagePrice: 156.52623552999327,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AMP",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 156.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 3,
                    symbol: "AMP",
                    averagePrice: 156.52623552999327,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "AMP",
                    averagePrice: 156.78717260410014,
                    status: OrderStatus.filled
                },
                symbol: "AMP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573655820000
            }
        ]
    },
    {
        symbol: "TIF",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 126,
        plannedStopPrice: 123,
        plannedQuantity: 3,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "TIF",
            averagePrice: 125.57758383055622,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TIF",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 125.5,
                t: 1573223760000,
                order: {
                    filledQuantity: 3,
                    symbol: "TIF",
                    averagePrice: 125.57758383055622,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "TIF",
                    averagePrice: 122.9822220481527,
                    status: OrderStatus.filled
                },
                symbol: "TIF",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573656660000
            }
        ]
    },
    {
        symbol: "WCG",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 302.5,
        plannedStopPrice: 296,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "WCG",
            averagePrice: 300.0176782811895,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WCG",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 300,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "WCG",
                    averagePrice: 300.0176782811895,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "WCG",
                    averagePrice: 306.0852235238867,
                    status: OrderStatus.filled
                },
                symbol: "WCG",
                price: 306.125,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573657920000
            }
        ]
    },
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
        order: {
            filledQuantity: 5,
            symbol: "EIX",
            averagePrice: 65.98807759111457,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EIX",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 66,
                t: 1573050960000,
                order: {
                    filledQuantity: 5,
                    symbol: "EIX",
                    averagePrice: 65.98807759111457,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "EIX",
                    averagePrice: 68.05350615382851,
                    status: OrderStatus.filled
                },
                symbol: "EIX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573661100000
            }
        ]
    },
    {
        symbol: "HCA",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 137,
        plannedStopPrice: 134,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "HCA",
            averagePrice: 137.06353402922102,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HCA",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 137,
                t: 1573223760000,
                order: {
                    filledQuantity: 3,
                    symbol: "HCA",
                    averagePrice: 137.06353402922102,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "HCA",
                    averagePrice: 134.03718643881237,
                    status: OrderStatus.filled
                },
                symbol: "HCA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573671540000
            }
        ]
    },
    {
        symbol: "CCI",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 130.5,
        plannedStopPrice: 134,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "CCI",
            averagePrice: 130.92208503845794,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CCI",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 131,
                t: 1573655760000,
                order: {
                    filledQuantity: 2,
                    symbol: "CCI",
                    averagePrice: 130.92208503845794,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CCI",
                    averagePrice: 134.0789716428672,
                    status: OrderStatus.filled
                },
                symbol: "CCI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1573829160000
            }
        ]
    },
    {
        symbol: "HCA",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 135.5,
        plannedStopPrice: 132,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "HCA",
            averagePrice: 135.01846338924727,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HCA",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 135,
                t: 1573742160000,
                order: {
                    filledQuantity: 2,
                    symbol: "HCA",
                    averagePrice: 135.01846338924727,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "HCA",
                    averagePrice: 138.1066325587671,
                    status: OrderStatus.filled
                },
                symbol: "HCA",
                price: 138.19,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573845840000
            }
        ]
    },
    {
        symbol: "CVS",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 73,
        plannedStopPrice: 72,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "CVS",
            averagePrice: 73.5398227524833,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CVS",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 73.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 10,
                    symbol: "CVS",
                    averagePrice: 73.5398227524833,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "CVS",
                    averagePrice: 74.52642021848916,
                    status: OrderStatus.filled
                },
                symbol: "CVS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1574087460000
            }
        ]
    },
    {
        symbol: "TRV",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 133,
        plannedStopPrice: 135,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "TRV",
            averagePrice: 133.40643794546003,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TRV",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 133.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 5,
                    symbol: "TRV",
                    averagePrice: 133.40643794546003,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "TRV",
                    averagePrice: 135.01332487626857,
                    status: OrderStatus.filled
                },
                symbol: "TRV",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574174400000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 73,
        plannedStopPrice: 71.95270987026069,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5472901297393094,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "STT",
            averagePrice: 72.59404941275392,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 72.5,
                t: 1573742160000,
                order: {
                    filledQuantity: 9,
                    symbol: "STT",
                    averagePrice: 72.59404941275392,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "STT",
                    averagePrice: 73.80313102623882,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 73.89,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1574173860000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "STT",
                    averagePrice: 73.36519459101822,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574190060000
            }
        ]
    },
    {
        symbol: "WCG",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 319,
        plannedStopPrice: 312,
        plannedQuantity: 1,
        plannedRiskUnits: 5.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "WCG",
            averagePrice: 317.5510881799382,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WCG",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 317.5,
                t: 1574260560000,
                order: {
                    filledQuantity: 1,
                    symbol: "WCG",
                    averagePrice: 317.5510881799382,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "WCG",
                    averagePrice: 323.9760608924946,
                    status: OrderStatus.filled
                },
                symbol: "WCG",
                price: 324.03,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574700120000
            }
        ]
    },
    {
        symbol: "CVS",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 75.5,
        plannedStopPrice: 74,
        plannedQuantity: 6,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "CVS",
            averagePrice: 76.00624911356431,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CVS",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76,
                t: 1574692560000,
                order: {
                    filledQuantity: 6,
                    symbol: "CVS",
                    averagePrice: 76.00624911356431,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "CVS",
                    averagePrice: 73.95838328440632,
                    status: OrderStatus.filled
                },
                symbol: "CVS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1575383460000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 75.5,
        plannedStopPrice: 73,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "STT",
            averagePrice: 75.52131832062024,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 75.5,
                t: 1575297360000,
                order: {
                    filledQuantity: 4,
                    symbol: "STT",
                    averagePrice: 75.52131832062024,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "STT",
                    averagePrice: 76.67382292563552,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1575645960000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 80.5,
        plannedStopPrice: 78,
        plannedQuantity: 4,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "STT",
            averagePrice: 80.07792163183484,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 80,
                t: 1576593360000,
                order: {
                    filledQuantity: 4,
                    symbol: "STT",
                    averagePrice: 80.07792163183484,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "STT",
                    averagePrice: 79.47078968742302,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1577127300000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 79.5,
        plannedStopPrice: 78,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "STT",
            averagePrice: 79.56100946853357,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 79.5,
                t: 1577198160000,
                order: {
                    filledQuantity: 6,
                    symbol: "STT",
                    averagePrice: 79.56100946853357,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "STT",
                    averagePrice: 81.66603189290916,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 81.755,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1578407460000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "STT",
                    averagePrice: 82.6138810180301,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1578589020000
            }
        ]
    },
    {
        symbol: "LVS",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 64.5,
        plannedStopPrice: 66,
        plannedQuantity: 6,
        plannedRiskUnits: 0,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LVS",
            averagePrice: 65.91996372189405,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LVS",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 66,
                t: 1580740560000,
                order: {
                    filledQuantity: 6,
                    symbol: "LVS",
                    averagePrice: 65.91996372189405,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LVS",
                    averagePrice: 62.130813848884095,
                    status: OrderStatus.filled
                },
                symbol: "LVS",
                price: 62.095,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1580740620000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LVS",
                    averagePrice: 67.0178885538145,
                    status: OrderStatus.filled
                },
                symbol: "LVS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580740680000
            }
        ]
    },
    {
        symbol: "STT",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 75.5,
        plannedStopPrice: 78,
        plannedQuantity: 4,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "STT",
            averagePrice: 75.96394435029768,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "STT",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76,
                t: 1580222160000,
                order: {
                    filledQuantity: 4,
                    symbol: "STT",
                    averagePrice: 75.96394435029768,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "STT",
                    averagePrice: 69.18561611933602,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 69.1841,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1580222220000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "STT",
                    averagePrice: 78.2033550577326,
                    status: OrderStatus.filled
                },
                symbol: "STT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580826960000
            }
        ]
    },
    {
        symbol: "CNQ",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 29,
        plannedStopPrice: 30,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "CNQ",
            averagePrice: 29.441108120992702,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CNQ",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 29.5,
                t: 1581431760000,
                order: {
                    filledQuantity: 10,
                    symbol: "CNQ",
                    averagePrice: 29.441108120992702,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "CNQ",
                    averagePrice: 25.94994784246408,
                    status: OrderStatus.filled
                },
                symbol: "CNQ",
                price: 25.93,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1581431820000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CNQ",
                    averagePrice: 30.142596478297495,
                    status: OrderStatus.filled
                },
                symbol: "CNQ",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1581518100000
            }
        ]
    },
    {
        symbol: "MO",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 46.5,
        plannedStopPrice: 47.06402550622837,
        plannedQuantity: 18,
        plannedRiskUnits: 1.0640255062283686,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "MO",
            averagePrice: 45.98821977346546,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MO",
                quantity: 18,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 46,
                t: 1581086160000,
                order: {
                    filledQuantity: 18,
                    symbol: "MO",
                    averagePrice: 45.98821977346546,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 14,
                    symbol: "MO",
                    averagePrice: 45.25919576900585,
                    status: OrderStatus.filled
                },
                symbol: "MO",
                price: 45.22,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 14,
                t: 1581086220000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "MO",
                    averagePrice: 44.87200096673729,
                    status: OrderStatus.filled
                },
                symbol: "MO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1582562700000
            }
        ]
    },
    {
        symbol: "TIF",
        originalQuantity: 19,
        hasHardStop: false,
        plannedEntryPrice: 133.5,
        plannedStopPrice: 134.01613969011044,
        plannedQuantity: 19,
        plannedRiskUnits: 0.5161396901104354,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 19,
            symbol: "TIF",
            averagePrice: 133.48127423310112,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TIF",
                quantity: 19,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 133.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 19,
                    symbol: "TIF",
                    averagePrice: 133.48127423310112,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "TIF",
                    averagePrice: 127.1429532589065,
                    status: OrderStatus.filled
                },
                symbol: "TIF",
                price: 127.1,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1583419020000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "TIF",
                    averagePrice: 132.45195092493788,
                    status: OrderStatus.filled
                },
                symbol: "TIF",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1583524980000
            }
        ]
    },
    {
        symbol: "AKAM",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 92,
        plannedStopPrice: 95,
        plannedQuantity: 3,
        plannedRiskUnits: 5.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "AKAM",
            averagePrice: 89.42278467243588,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AKAM",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 89.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 3,
                    symbol: "AKAM",
                    averagePrice: 89.42278467243588,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "AKAM",
                    averagePrice: 83.78683641840264,
                    status: OrderStatus.filled
                },
                symbol: "AKAM",
                price: 83.7,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "HSY",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 139,
        plannedStopPrice: 142,
        plannedQuantity: 3,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "HSY",
            averagePrice: 141.408457711066,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HSY",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 141.5,
                t: 1573050960000,
                order: {
                    filledQuantity: 3,
                    symbol: "HSY",
                    averagePrice: 141.408457711066,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "HSY",
                    averagePrice: 142.16527475793302,
                    status: OrderStatus.filled
                },
                symbol: "HSY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573223640000
            }
        ]
    },
    {
        symbol: "AMGN",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 218.5,
        plannedStopPrice: 213,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "AMGN",
            averagePrice: 217.08810986169397,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AMGN",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 217,
                t: 1573137360000,
                order: {
                    filledQuantity: 1,
                    symbol: "AMGN",
                    averagePrice: 217.08810986169397,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "AMGN",
                    averagePrice: 222.1107964502092,
                    status: OrderStatus.filled
                },
                symbol: "AMGN",
                price: 222.14,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573569840000
            }
        ]
    },
    {
        symbol: "NTAP",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 60,
        plannedStopPrice: 59,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "NTAP",
            averagePrice: 60.004888930376396,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NTAP",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 60,
                t: 1573655760000,
                order: {
                    filledQuantity: 10,
                    symbol: "NTAP",
                    averagePrice: 60.004888930376396,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "NTAP",
                    averagePrice: 60.920713727947096,
                    status: OrderStatus.filled
                },
                symbol: "NTAP",
                price: 60.93,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1573670940000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "NTAP",
                    averagePrice: 62.19774805127938,
                    status: OrderStatus.filled
                },
                symbol: "NTAP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1573678800000
            }
        ]
    },
    {
        symbol: "CAH",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 54,
        plannedStopPrice: 53,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "CAH",
            averagePrice: 54.0582251571921,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CAH",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 54,
                t: 1573655760000,
                order: {
                    filledQuantity: 10,
                    symbol: "CAH",
                    averagePrice: 54.0582251571921,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "CAH",
                    averagePrice: 55.08784051272056,
                    status: OrderStatus.filled
                },
                symbol: "CAH",
                price: 55.095,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1573741920000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CAH",
                    averagePrice: 56.120360643228864,
                    status: OrderStatus.filled
                },
                symbol: "CAH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1573847700000
            }
        ]
    },
    {
        symbol: "ALGN",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 260,
        plannedStopPrice: 252,
        plannedQuantity: 1,
        plannedRiskUnits: 6,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ALGN",
            averagePrice: 258.0710948448286,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ALGN",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 258,
                t: 1573050960000,
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 258.0710948448286,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 265.9611203012718,
                    status: OrderStatus.filled
                },
                symbol: "ALGN",
                price: 265.99,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574087460000
            }
        ]
    },
    {
        symbol: "AMGN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 221.5,
        plannedStopPrice: 217,
        plannedQuantity: 2,
        plannedRiskUnits: 5.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "AMGN",
            averagePrice: 222.57082455010504,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AMGN",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 222.5,
                t: 1574174160000,
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 222.57082455010504,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 223.06510654142986,
                    status: OrderStatus.filled
                },
                symbol: "AMGN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574188080000
            }
        ]
    },
    {
        symbol: "DVA",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 71.5,
        plannedStopPrice: 69,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "DVA",
            averagePrice: 71.52804569191626,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DVA",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 71.5,
                t: 1574174160000,
                order: {
                    filledQuantity: 4,
                    symbol: "DVA",
                    averagePrice: 71.52804569191626,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "DVA",
                    averagePrice: 72.60126689300635,
                    status: OrderStatus.filled
                },
                symbol: "DVA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1574189820000
            }
        ]
    },
    {
        symbol: "MAR",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 136.5,
        plannedStopPrice: 133,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "MAR",
            averagePrice: 136.04874547456924,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MAR",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 136,
                t: 1574174160000,
                order: {
                    filledQuantity: 2,
                    symbol: "MAR",
                    averagePrice: 136.04874547456924,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MAR",
                    averagePrice: 135.8059103580499,
                    status: OrderStatus.filled
                },
                symbol: "MAR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574191920000
            }
        ]
    },
    {
        symbol: "AMGN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 235.5,
        plannedStopPrice: 232,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "AMGN",
            averagePrice: 235.57167077049598,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AMGN",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 235.5,
                t: 1575297360000,
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 235.57167077049598,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 231.8261846010511,
                    status: OrderStatus.filled
                },
                symbol: "AMGN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575384360000
            }
        ]
    },
    {
        symbol: "DVA",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 72,
        plannedStopPrice: 71,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "DVA",
            averagePrice: 71.56081351281367,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DVA",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 71.5,
                t: 1575383760000,
                order: {
                    filledQuantity: 10,
                    symbol: "DVA",
                    averagePrice: 71.56081351281367,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "DVA",
                    averagePrice: 72.39820834966818,
                    status: OrderStatus.filled
                },
                symbol: "DVA",
                price: 72.475,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1575396600000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "DVA",
                    averagePrice: 72.76281564982308,
                    status: OrderStatus.filled
                },
                symbol: "DVA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575654060000
            }
        ]
    },
    {
        symbol: "DVA",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 73,
        plannedStopPrice: 71.95240112209582,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5475988779041785,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "DVA",
            averagePrice: 72.5121661123273,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DVA",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 72.5,
                t: 1576161360000,
                order: {
                    filledQuantity: 9,
                    symbol: "DVA",
                    averagePrice: 72.5121661123273,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "DVA",
                    averagePrice: 73.4372110532805,
                    status: OrderStatus.filled
                },
                symbol: "DVA",
                price: 73.48,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1576163940000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "DVA",
                    averagePrice: 71.92257819098664,
                    status: OrderStatus.filled
                },
                symbol: "DVA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576600740000
            }
        ]
    },
    {
        symbol: "ALGN",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 267,
        plannedStopPrice: 274,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ALGN",
            averagePrice: 268.9519176692187,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ALGN",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 269,
                t: 1576679760000,
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 268.9519176692187,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 257.93316603693427,
                    status: OrderStatus.filled
                },
                symbol: "ALGN",
                price: 257.84,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1576679820000
            }
        ]
    },
    {
        symbol: "INVH",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 29.5,
        plannedStopPrice: 31.016372550932022,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0163725509320223,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "INVH",
            averagePrice: 29.924435559080443,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INVH",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 30,
                t: 1573137360000,
                order: {
                    filledQuantity: 6,
                    symbol: "INVH",
                    averagePrice: 29.924435559080443,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "INVH",
                    averagePrice: 31.181944948845867,
                    status: OrderStatus.filled
                },
                symbol: "INVH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1579703460000
            }
        ]
    },
    {
        symbol: "AMGN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 220.5,
        plannedStopPrice: 225,
        plannedQuantity: 2,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "AMGN",
            averagePrice: 223.41195866186033,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AMGN",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 223.5,
                t: 1580913360000,
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 223.41195866186033,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AMGN",
                    averagePrice: 219.36648734985323,
                    status: OrderStatus.filled
                },
                symbol: "AMGN",
                price: 219.29,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580913420000
            }
        ]
    },
    {
        symbol: "VFC",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 83.5,
        plannedStopPrice: 85,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "VFC",
            averagePrice: 83.40282204984034,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VFC",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 83.5,
                t: 1580394960000,
                order: {
                    filledQuantity: 6,
                    symbol: "VFC",
                    averagePrice: 83.40282204984034,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "VFC",
                    averagePrice: 85.08740792823573,
                    status: OrderStatus.filled
                },
                symbol: "VFC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1580913540000
            }
        ]
    },
    {
        symbol: "ALGN",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 254,
        plannedStopPrice: 263,
        plannedQuantity: 1,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ALGN",
            averagePrice: 258.45185292348134,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ALGN",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 258.5,
                t: 1580913360000,
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 258.45185292348134,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ALGN",
                    averagePrice: 263.4140506727624,
                    status: OrderStatus.filled
                },
                symbol: "ALGN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580915820000
            }
        ]
    },
    {
        symbol: "VFC",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 82.5,
        plannedStopPrice: 85,
        plannedQuantity: 4,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "VFC",
            averagePrice: 83.406777798673,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VFC",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 83.5,
                t: 1581518160000,
                order: {
                    filledQuantity: 4,
                    symbol: "VFC",
                    averagePrice: 83.406777798673,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "VFC",
                    averagePrice: 81.21645521378407,
                    status: OrderStatus.filled
                },
                symbol: "VFC",
                price: 81.14,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1582641540000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "VFC",
                    averagePrice: 78.37650034958043,
                    status: OrderStatus.filled
                },
                symbol: "VFC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582655940000
            }
        ]
    },
    {
        symbol: "LBRDK",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 126,
        plannedStopPrice: 130,
        plannedQuantity: 2,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "LBRDK",
            averagePrice: 127.99466277131391,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LBRDK",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 128,
                t: 1583246160000,
                order: {
                    filledQuantity: 2,
                    symbol: "LBRDK",
                    averagePrice: 127.99466277131391,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "LBRDK",
                    averagePrice: 119.18321638509912,
                    status: OrderStatus.filled
                },
                symbol: "LBRDK",
                price: 119.1,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583246220000
            }
        ]
    },
    {
        symbol: "KMX",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 96,
        plannedStopPrice: 94,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "KMX",
            averagePrice: 95.5748521425566,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KMX",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 95.5,
                t: 1572964560000,
                order: {
                    filledQuantity: 5,
                    symbol: "KMX",
                    averagePrice: 95.5748521425566,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "KMX",
                    averagePrice: 94.01119221262302,
                    status: OrderStatus.filled
                },
                symbol: "KMX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573055460000
            }
        ]
    },
    {
        symbol: "ODFL",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 192.5,
        plannedStopPrice: 187,
        plannedQuantity: 1,
        plannedRiskUnits: 101,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ODFL",
            averagePrice: 288.04849553163024,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ODFL",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 288,
                t: 1573050960000,
                order: {
                    filledQuantity: 1,
                    symbol: "ODFL",
                    averagePrice: 288.04849553163024,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ODFL",
                    averagePrice: 293.99201047306906,
                    status: OrderStatus.filled
                },
                symbol: "ODFL",
                price: 294,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573137180000
            }
        ]
    },
    {
        symbol: "PNC",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 150.5,
        plannedStopPrice: 147,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PNC",
            averagePrice: 151.09284872440105,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PNC",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 151,
                t: 1572964560000,
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 151.09284872440105,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 154.3622770631125,
                    status: OrderStatus.filled
                },
                symbol: "PNC",
                price: 154.39,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573142400000
            }
        ]
    },
    {
        symbol: "GPC",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 106.5,
        plannedStopPrice: 104,
        plannedQuantity: 4,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "GPC",
            averagePrice: 106.06213213721692,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GPC",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 106,
                t: 1573482960000,
                order: {
                    filledQuantity: 4,
                    symbol: "GPC",
                    averagePrice: 106.06213213721692,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "GPC",
                    averagePrice: 103.57285229066453,
                    status: OrderStatus.filled
                },
                symbol: "GPC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "JPM",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 130,
        plannedStopPrice: 129,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "JPM",
            averagePrice: 130.05138147565884,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "JPM",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 130,
                t: 1573569360000,
                order: {
                    filledQuantity: 10,
                    symbol: "JPM",
                    averagePrice: 130.05138147565884,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "JPM",
                    averagePrice: 127.73544313560336,
                    status: OrderStatus.filled
                },
                symbol: "JPM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "ANTM",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 281,
        plannedStopPrice: 274,
        plannedQuantity: 1,
        plannedRiskUnits: 7,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ANTM",
            averagePrice: 281.00020139715616,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANTM",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 281,
                t: 1573223760000,
                order: {
                    filledQuantity: 1,
                    symbol: "ANTM",
                    averagePrice: 281.00020139715616,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ANTM",
                    averagePrice: 287.46260705922936,
                    status: OrderStatus.filled
                },
                symbol: "ANTM",
                price: 287.53,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573657860000
            }
        ]
    },
    {
        symbol: "VAR",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 126,
        plannedStopPrice: 122,
        plannedQuantity: 2,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "VAR",
            averagePrice: 124.56124679126899,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VAR",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 124.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 2,
                    symbol: "VAR",
                    averagePrice: 124.56124679126899,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "VAR",
                    averagePrice: 128.17144670868956,
                    status: OrderStatus.filled
                },
                symbol: "VAR",
                price: 128.19,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573834500000
            }
        ]
    },
    {
        symbol: "ANTM",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 284.5,
        plannedStopPrice: 279,
        plannedQuantity: 1,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ANTM",
            averagePrice: 282.0335097303284,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANTM",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 282,
                t: 1573828560000,
                order: {
                    filledQuantity: 1,
                    symbol: "ANTM",
                    averagePrice: 282.0335097303284,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ANTM",
                    averagePrice: 286.9536274899082,
                    status: OrderStatus.filled
                },
                symbol: "ANTM",
                price: 286.99,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573845540000
            }
        ]
    },
    {
        symbol: "MPLX",
        originalQuantity: 20,
        hasHardStop: false,
        plannedEntryPrice: 23.5,
        plannedStopPrice: 24,
        plannedQuantity: 20,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 20,
            symbol: "MPLX",
            averagePrice: 23.44383292044209,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MPLX",
                quantity: 20,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 23.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 20,
                    symbol: "MPLX",
                    averagePrice: 23.44383292044209,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "MPLX",
                    averagePrice: 23.015240835698155,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 22.99,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1574175420000
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "MPLX",
                    averagePrice: 22.700561778889192,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574189640000
            }
        ]
    },
    {
        symbol: "ITW",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 175.5,
        plannedStopPrice: 172,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "ITW",
            averagePrice: 176.03928739370778,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ITW",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 176,
                t: 1572964560000,
                order: {
                    filledQuantity: 2,
                    symbol: "ITW",
                    averagePrice: 176.03928739370778,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "ITW",
                    averagePrice: 171.9846187353237,
                    status: OrderStatus.filled
                },
                symbol: "ITW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574272500000
            }
        ]
    },
    {
        symbol: "DPZ",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 290,
        plannedStopPrice: 284,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "DPZ",
            averagePrice: 288.0606247599549,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DPZ",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 288,
                t: 1574346960000,
                order: {
                    filledQuantity: 1,
                    symbol: "DPZ",
                    averagePrice: 288.0606247599549,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "DPZ",
                    averagePrice: 283.7400245404918,
                    status: OrderStatus.filled
                },
                symbol: "DPZ",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574363760000
            }
        ]
    },
    {
        symbol: "CL",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 66,
        plannedStopPrice: 68.03929593002354,
        plannedQuantity: 4,
        plannedRiskUnits: 2.039295930023542,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "CL",
            averagePrice: 65.9067972044211,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CL",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 66,
                t: 1573137360000,
                order: {
                    filledQuantity: 4,
                    symbol: "CL",
                    averagePrice: 65.9067972044211,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CL",
                    averagePrice: 68.11198916191303,
                    status: OrderStatus.filled
                },
                symbol: "CL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1575471240000
            }
        ]
    },
    {
        symbol: "BMY",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 57,
        plannedStopPrice: 55.94807129337994,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0519287066200604,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "BMY",
            averagePrice: 57.04065554474351,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BMY",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 57,
                t: 1574865360000,
                order: {
                    filledQuantity: 9,
                    symbol: "BMY",
                    averagePrice: 57.04065554474351,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "BMY",
                    averagePrice: 57.94581657111472,
                    status: OrderStatus.filled
                },
                symbol: "BMY",
                price: 58.0435,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1575297420000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BMY",
                    averagePrice: 59.25408574865557,
                    status: OrderStatus.filled
                },
                symbol: "BMY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575557220000
            }
        ]
    },
    {
        symbol: "MPLX",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 24,
        plannedStopPrice: 25,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "MPLX",
            averagePrice: 23.992230777299792,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MPLX",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 24,
                t: 1574778960000,
                order: {
                    filledQuantity: 10,
                    symbol: "MPLX",
                    averagePrice: 23.992230777299792,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "MPLX",
                    averagePrice: 23.076419003963327,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 23.065,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1575302820000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MPLX",
                    averagePrice: 24.122596265790683,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575648540000
            }
        ]
    },
    {
        symbol: "TAL",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 44.5,
        plannedStopPrice: 42.939269308615486,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0607306913845136,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "TAL",
            averagePrice: 44.096551172830615,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TAL",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 44,
                t: 1573828560000,
                order: {
                    filledQuantity: 6,
                    symbol: "TAL",
                    averagePrice: 44.096551172830615,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "TAL",
                    averagePrice: 45.509618091433175,
                    status: OrderStatus.filled
                },
                symbol: "TAL",
                price: 45.54,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1575556560000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "TAL",
                    averagePrice: 47.33596313921974,
                    status: OrderStatus.filled
                },
                symbol: "TAL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1576679640000
            }
        ]
    },
    {
        symbol: "TAL",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 48,
        plannedStopPrice: 47,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "TAL",
            averagePrice: 47.5794788459799,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TAL",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 47.5,
                t: 1577198160000,
                order: {
                    filledQuantity: 10,
                    symbol: "TAL",
                    averagePrice: 47.5794788459799,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "TAL",
                    averagePrice: 47.74945564651021,
                    status: OrderStatus.filled
                },
                symbol: "TAL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1577199900000
            }
        ]
    },
    {
        symbol: "TAL",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 48.5,
        plannedStopPrice: 47.96948386234685,
        plannedQuantity: 18,
        plannedRiskUnits: 1.0305161376531515,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "TAL",
            averagePrice: 49.052657834416124,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TAL",
                quantity: 18,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 49,
                t: 1577975760000,
                order: {
                    filledQuantity: 18,
                    symbol: "TAL",
                    averagePrice: 49.052657834416124,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 14,
                    symbol: "TAL",
                    averagePrice: 49.470659785912694,
                    status: OrderStatus.filled
                },
                symbol: "TAL",
                price: 49.57,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 14,
                t: 1578069960000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "TAL",
                    averagePrice: 50.20001888609158,
                    status: OrderStatus.filled
                },
                symbol: "TAL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1578344280000
            }
        ]
    },
    {
        symbol: "MPLX",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 25.5,
        plannedStopPrice: 23.971782234637523,
        plannedQuantity: 6,
        plannedRiskUnits: 1.528217765362477,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "MPLX",
            averagePrice: 25.543390124128596,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MPLX",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 25.5,
                t: 1576161360000,
                order: {
                    filledQuantity: 6,
                    symbol: "MPLX",
                    averagePrice: 25.543390124128596,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "MPLX",
                    averagePrice: 26.91645484498243,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 26.925,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1578322800000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "MPLX",
                    averagePrice: 23.966728832445074,
                    status: OrderStatus.filled
                },
                symbol: "MPLX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580223420000
            }
        ]
    },
    {
        symbol: "EL",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 198,
        plannedStopPrice: 203,
        plannedQuantity: 2,
        plannedRiskUnits: 6,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "EL",
            averagePrice: 196.99536495123894,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EL",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 197,
                t: 1580394960000,
                order: {
                    filledQuantity: 2,
                    symbol: "EL",
                    averagePrice: 196.99536495123894,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EL",
                    averagePrice: 186.30672025689267,
                    status: OrderStatus.filled
                },
                symbol: "EL",
                price: 186.3,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580395020000
            }
        ]
    },
    {
        symbol: "FTV",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 75,
        plannedStopPrice: 77.04903961598451,
        plannedQuantity: 4,
        plannedRiskUnits: 2.549039615984512,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "FTV",
            averagePrice: 74.42856375036216,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FTV",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 74.5,
                t: 1580394960000,
                order: {
                    filledQuantity: 4,
                    symbol: "FTV",
                    averagePrice: 74.42856375036216,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "FTV",
                    averagePrice: 77.48176678223427,
                    status: OrderStatus.filled
                },
                symbol: "FTV",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1580850000000
            }
        ]
    },
    {
        symbol: "BMY",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 63.5,
        plannedStopPrice: 65,
        plannedQuantity: 6,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "BMY",
            averagePrice: 62.99165272243177,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BMY",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 63,
                t: 1580481360000,
                order: {
                    filledQuantity: 6,
                    symbol: "BMY",
                    averagePrice: 62.99165272243177,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BMY",
                    averagePrice: 56.97747136241951,
                    status: OrderStatus.filled
                },
                symbol: "BMY",
                price: 56.94,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1580481420000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BMY",
                    averagePrice: 65.4766568780956,
                    status: OrderStatus.filled
                },
                symbol: "BMY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580913060000
            }
        ]
    },
    {
        symbol: "VAR",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 141,
        plannedStopPrice: 145,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "VAR",
            averagePrice: 141.93532185988664,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VAR",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 142,
                t: 1580913360000,
                order: {
                    filledQuantity: 2,
                    symbol: "VAR",
                    averagePrice: 141.93532185988664,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "VAR",
                    averagePrice: 123.24239481919932,
                    status: OrderStatus.filled
                },
                symbol: "VAR",
                price: 123.21,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580913420000
            }
        ]
    },
    {
        symbol: "PNC",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 149.5,
        plannedStopPrice: 153,
        plannedQuantity: 2,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PNC",
            averagePrice: 151.4518847812185,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PNC",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 151.5,
                t: 1580826960000,
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 151.4518847812185,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 153.03057374209496,
                    status: OrderStatus.filled
                },
                symbol: "PNC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1580915040000
            }
        ]
    },
    {
        symbol: "RCL",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 109.5,
        plannedStopPrice: 114,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "RCL",
            averagePrice: 110.41234608242948,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "RCL",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 110.5,
                t: 1581431760000,
                order: {
                    filledQuantity: 2,
                    symbol: "RCL",
                    averagePrice: 110.41234608242948,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "RCL",
                    averagePrice: 115.59926844082379,
                    status: OrderStatus.filled
                },
                symbol: "RCL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1581517860000
            }
        ]
    },
    {
        symbol: "PNC",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 152.5,
        plannedStopPrice: 156,
        plannedQuantity: 2,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PNC",
            averagePrice: 154.46932071927364,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PNC",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 154.5,
                t: 1580999760000,
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 154.46932071927364,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PNC",
                    averagePrice: 156.04791251938366,
                    status: OrderStatus.filled
                },
                symbol: "PNC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1581518220000
            }
        ]
    },
    {
        symbol: "EQR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 84,
        plannedStopPrice: 83,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "EQR",
            averagePrice: 84.56491055516258,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EQR",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84.5,
                t: 1581086160000,
                order: {
                    filledQuantity: 10,
                    symbol: "EQR",
                    averagePrice: 84.56491055516258,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "EQR",
                    averagePrice: 87.92950488223354,
                    status: OrderStatus.filled
                },
                symbol: "EQR",
                price: 87.96,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1581086220000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EQR",
                    averagePrice: 86.6018057853397,
                    status: OrderStatus.filled
                },
                symbol: "EQR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1582036980000
            }
        ]
    },
    {
        symbol: "RCL",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 112.5,
        plannedStopPrice: 116,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "RCL",
            averagePrice: 111.94157578681191,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "RCL",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 112,
                t: 1582036560000,
                order: {
                    filledQuantity: 2,
                    symbol: "RCL",
                    averagePrice: 111.94157578681191,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "RCL",
                    averagePrice: 108.24923971244243,
                    status: OrderStatus.filled
                },
                symbol: "RCL",
                price: 108.15,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1582295460000
            }
        ]
    },
    {
        symbol: "SSNC",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 55.5,
        plannedStopPrice: 59,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "SSNC",
            averagePrice: 55.4621730634784,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SSNC",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 55.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 2,
                    symbol: "SSNC",
                    averagePrice: 55.4621730634784,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "SSNC",
                    averagePrice: 52.34160287467318,
                    status: OrderStatus.filled
                },
                symbol: "SSNC",
                price: 52.2702,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583505360000
            }
        ]
    },
    {
        symbol: "PTC",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 69.5,
        plannedStopPrice: 74,
        plannedQuantity: 2,
        plannedRiskUnits: 6,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PTC",
            averagePrice: 67.98913269973143,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PTC",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 68,
                t: 1583418960000,
                order: {
                    filledQuantity: 2,
                    symbol: "PTC",
                    averagePrice: 67.98913269973143,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PTC",
                    averagePrice: 59.429762728450406,
                    status: OrderStatus.filled
                },
                symbol: "PTC",
                price: 59.385,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "HEI",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 123,
        plannedStopPrice: 126,
        plannedQuantity: 3,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "HEI",
            averagePrice: 124.47853331687303,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HEI",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 124.5,
                t: 1572878160000,
                order: {
                    filledQuantity: 3,
                    symbol: "HEI",
                    averagePrice: 124.47853331687303,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "HEI",
                    averagePrice: 121.83165078657451,
                    status: OrderStatus.filled
                },
                symbol: "HEI",
                price: 121.75,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1572898680000
            }
        ]
    },
    {
        symbol: "RCI",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 46.5,
        plannedStopPrice: 48.027255374562,
        plannedQuantity: 6,
        plannedRiskUnits: 1.027255374562003,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "RCI",
            averagePrice: 46.9017277719537,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "RCI",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 47,
                t: 1572615360000,
                order: {
                    filledQuantity: 6,
                    symbol: "RCI",
                    averagePrice: 46.9017277719537,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "RCI",
                    averagePrice: 48.0549978758975,
                    status: OrderStatus.filled
                },
                symbol: "RCI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573142700000
            }
        ]
    },
    {
        symbol: "RTN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 214,
        plannedStopPrice: 210,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "RTN",
            averagePrice: 213.58760308726855,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "RTN",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 213.5,
                t: 1573050960000,
                order: {
                    filledQuantity: 2,
                    symbol: "RTN",
                    averagePrice: 213.58760308726855,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "RTN",
                    averagePrice: 217.1955937281422,
                    status: OrderStatus.filled
                },
                symbol: "RTN",
                price: 217.265,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573149540000
            }
        ]
    },
    {
        symbol: "VRTX",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 198.5,
        plannedStopPrice: 194,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "VRTX",
            averagePrice: 197.04147596057211,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VRTX",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 197,
                t: 1573137360000,
                order: {
                    filledQuantity: 2,
                    symbol: "VRTX",
                    averagePrice: 197.04147596057211,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "VRTX",
                    averagePrice: 201.02779331395075,
                    status: OrderStatus.filled
                },
                symbol: "VRTX",
                price: 201.1072,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573228680000
            }
        ]
    },
    {
        symbol: "HEI",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 121,
        plannedStopPrice: 123,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "HEI",
            averagePrice: 121.94091140070759,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HEI",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 122,
                t: 1573137360000,
                order: {
                    filledQuantity: 5,
                    symbol: "HEI",
                    averagePrice: 121.94091140070759,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "HEI",
                    averagePrice: 123.13184763919651,
                    status: OrderStatus.filled
                },
                symbol: "HEI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573496520000
            }
        ]
    },
    {
        symbol: "SIVB",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 240,
        plannedStopPrice: 233,
        plannedQuantity: 1,
        plannedRiskUnits: 3.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "SIVB",
            averagePrice: 236.59689035128795,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SIVB",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 236.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 1,
                    symbol: "SIVB",
                    averagePrice: 236.59689035128795,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "SIVB",
                    averagePrice: 232.7681710472492,
                    status: OrderStatus.filled
                },
                symbol: "SIVB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "LEN",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 58,
        plannedStopPrice: 60.089841947259394,
        plannedQuantity: 4,
        plannedRiskUnits: 1.0898419472593943,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "LEN",
            averagePrice: 58.90301596689492,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LEN",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 59,
                t: 1573137360000,
                order: {
                    filledQuantity: 4,
                    symbol: "LEN",
                    averagePrice: 58.90301596689492,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "LEN",
                    averagePrice: 60.17624255510502,
                    status: OrderStatus.filled
                },
                symbol: "LEN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1573828260000
            }
        ]
    },
    {
        symbol: "RTN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 217.5,
        plannedStopPrice: 214,
        plannedQuantity: 2,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "RTN",
            averagePrice: 215.0329938567806,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "RTN",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 215,
                t: 1573223760000,
                order: {
                    filledQuantity: 2,
                    symbol: "RTN",
                    averagePrice: 215.0329938567806,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "RTN",
                    averagePrice: 218.58636715312937,
                    status: OrderStatus.filled
                },
                symbol: "RTN",
                price: 218.6,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573828260000
            }
        ]
    },
    {
        symbol: "DLR",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 116,
        plannedStopPrice: 119,
        plannedQuantity: 3,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "DLR",
            averagePrice: 116.42488302208801,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DLR",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 116.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 3,
                    symbol: "DLR",
                    averagePrice: 116.42488302208801,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "DLR",
                    averagePrice: 119.30985061530586,
                    status: OrderStatus.filled
                },
                symbol: "DLR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573851600000
            }
        ]
    },
    {
        symbol: "CNC",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 55,
        plannedStopPrice: 53,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CNC",
            averagePrice: 54.59107058044924,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CNC",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 54.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 5,
                    symbol: "CNC",
                    averagePrice: 54.59107058044924,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CNC",
                    averagePrice: 56.39710757766942,
                    status: OrderStatus.filled
                },
                symbol: "CNC",
                price: 56.48,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1573846440000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CNC",
                    averagePrice: 58.97706451874849,
                    status: OrderStatus.filled
                },
                symbol: "CNC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574087460000
            }
        ]
    },
    {
        symbol: "DUK",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 88,
        plannedStopPrice: 89,
        plannedQuantity: 10,
        plannedRiskUnits: 0,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "DUK",
            averagePrice: 88.93788231670021,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DUK",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 89,
                t: 1574087760000,
                order: {
                    filledQuantity: 10,
                    symbol: "DUK",
                    averagePrice: 88.93788231670021,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "DUK",
                    averagePrice: 89.11211478261298,
                    status: OrderStatus.filled
                },
                symbol: "DUK",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1574087820000
            }
        ]
    },
    {
        symbol: "O",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 76.5,
        plannedStopPrice: 78,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "O",
            averagePrice: 76.4455319013293,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "O",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 6,
                    symbol: "O",
                    averagePrice: 76.4455319013293,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "O",
                    averagePrice: 78.14765874712238,
                    status: OrderStatus.filled
                },
                symbol: "O",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574087940000
            }
        ]
    },
    {
        symbol: "SIVB",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 234,
        plannedStopPrice: 229,
        plannedQuantity: 2,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "SIVB",
            averagePrice: 234.0798820992111,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SIVB",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 234,
                t: 1573828560000,
                order: {
                    filledQuantity: 2,
                    symbol: "SIVB",
                    averagePrice: 234.0798820992111,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "SIVB",
                    averagePrice: 229.03118441529136,
                    status: OrderStatus.filled
                },
                symbol: "SIVB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574090820000
            }
        ]
    },
    {
        symbol: "VRTX",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 210,
        plannedStopPrice: 206,
        plannedQuantity: 2,
        plannedRiskUnits: 7.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "VRTX",
            averagePrice: 213.5481624362024,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VRTX",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 213.5,
                t: 1574174160000,
                order: {
                    filledQuantity: 2,
                    symbol: "VRTX",
                    averagePrice: 213.5481624362024,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "VRTX",
                    averagePrice: 215.96591611956637,
                    status: OrderStatus.filled
                },
                symbol: "VRTX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574264100000
            }
        ]
    },
    {
        symbol: "EPD",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 26,
        plannedStopPrice: 27.023675820243874,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5236758202438736,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "EPD",
            averagePrice: 26.459674594176565,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EPD",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 26.5,
                t: 1573223760000,
                order: {
                    filledQuantity: 9,
                    symbol: "EPD",
                    averagePrice: 26.459674594176565,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "EPD",
                    averagePrice: 25.56334870150345,
                    status: OrderStatus.filled
                },
                symbol: "EPD",
                price: 25.535,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1574176920000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EPD",
                    averagePrice: 27.054416335409382,
                    status: OrderStatus.filled
                },
                symbol: "EPD",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575989940000
            }
        ]
    },
    {
        symbol: "MTCH",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 84,
        plannedStopPrice: 86,
        plannedQuantity: 5,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "MTCH",
            averagePrice: 82.97671404305305,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MTCH",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 83,
                t: 1580308560000,
                order: {
                    filledQuantity: 5,
                    symbol: "MTCH",
                    averagePrice: 82.97671404305305,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "MTCH",
                    averagePrice: 72.95745145053313,
                    status: OrderStatus.filled
                },
                symbol: "MTCH",
                price: 72.91,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1580308620000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "MTCH",
                    averagePrice: 78.92260401635464,
                    status: OrderStatus.filled
                },
                symbol: "MTCH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580486940000
            }
        ]
    },
    {
        symbol: "MFC",
        originalQuantity: 19,
        hasHardStop: false,
        plannedEntryPrice: 19.5,
        plannedStopPrice: 20.016924322019477,
        plannedQuantity: 19,
        plannedRiskUnits: 0.016924322019477245,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 19,
            symbol: "MFC",
            averagePrice: 19.99309305239872,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MFC",
                quantity: 19,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 20,
                t: 1580913360000,
                order: {
                    filledQuantity: 19,
                    symbol: "MFC",
                    averagePrice: 19.99309305239872,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "MFC",
                    averagePrice: 19.103908815778826,
                    status: OrderStatus.filled
                },
                symbol: "MFC",
                price: 19.09,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1580913420000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "MFC",
                    averagePrice: 20.073008117528968,
                    status: OrderStatus.filled
                },
                symbol: "MFC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1580918100000
            }
        ]
    },
    {
        symbol: "MFC",
        originalQuantity: 692,
        hasHardStop: false,
        plannedEntryPrice: 20,
        plannedStopPrice: 20.014523632108453,
        plannedQuantity: 692,
        plannedRiskUnits: 0.0145236321084532,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 692,
            symbol: "MFC",
            averagePrice: 19.949898889590308,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MFC",
                quantity: 692,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 20,
                t: 1580999760000,
                order: {
                    filledQuantity: 692,
                    symbol: "MFC",
                    averagePrice: 19.949898889590308,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 692,
                    symbol: "MFC",
                    averagePrice: 20.087603132432637,
                    status: OrderStatus.filled
                },
                symbol: "MFC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 692,
                t: 1581000420000
            }
        ]
    },
    {
        symbol: "IAC",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 234.5,
        plannedStopPrice: 241,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "IAC",
            averagePrice: 236.933859044397,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IAC",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 237,
                t: 1582036560000,
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 236.933859044397,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 227.16427471758067,
                    status: OrderStatus.filled
                },
                symbol: "IAC",
                price: 227.0825,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1582036620000
            }
        ]
    },
    {
        symbol: "YUMC",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 43.5,
        plannedStopPrice: 46,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "YUMC",
            averagePrice: 43.44306278986131,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "YUMC",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 43.5,
                t: 1580481360000,
                order: {
                    filledQuantity: 4,
                    symbol: "YUMC",
                    averagePrice: 43.44306278986131,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "YUMC",
                    averagePrice: 46.087172054125794,
                    status: OrderStatus.filled
                },
                symbol: "YUMC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1582130760000
            }
        ]
    },
    {
        symbol: "IAC",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 235.5,
        plannedStopPrice: 242,
        plannedQuantity: 1,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "IAC",
            averagePrice: 237.42507284605426,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IAC",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 237.5,
                t: 1582122960000,
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 237.42507284605426,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 231.51838833730417,
                    status: OrderStatus.filled
                },
                symbol: "IAC",
                price: 231.42,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1582216140000
            }
        ]
    },
    {
        symbol: "MTCH",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 75.5,
        plannedStopPrice: 80,
        plannedQuantity: 2,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "MTCH",
            averagePrice: 75.41108856075431,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MTCH",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 75.5,
                t: 1581431760000,
                order: {
                    filledQuantity: 2,
                    symbol: "MTCH",
                    averagePrice: 75.41108856075431,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MTCH",
                    averagePrice: 69.63775482561832,
                    status: OrderStatus.filled
                },
                symbol: "MTCH",
                price: 69.55,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1582554660000
            }
        ]
    },
    {
        symbol: "O",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 78.5,
        plannedStopPrice: 76,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "O",
            averagePrice: 78.54954124705232,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "O",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 78.5,
                t: 1580308560000,
                order: {
                    filledQuantity: 4,
                    symbol: "O",
                    averagePrice: 78.54954124705232,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "O",
                    averagePrice: 81.42152932448383,
                    status: OrderStatus.filled
                },
                symbol: "O",
                price: 81.5,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1582209060000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "O",
                    averagePrice: 74.88201495408754,
                    status: OrderStatus.filled
                },
                symbol: "O",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582813860000
            }
        ]
    },
    {
        symbol: "IAC",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 199.5,
        plannedStopPrice: 208,
        plannedQuantity: 1,
        plannedRiskUnits: 11.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "IAC",
            averagePrice: 196.49221593307018,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IAC",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 196.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 196.49221593307018,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "IAC",
                    averagePrice: 185.74119800519293,
                    status: OrderStatus.filled
                },
                symbol: "IAC",
                price: 185.65,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "LEN",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 64.5,
        plannedStopPrice: 67,
        plannedQuantity: 4,
        plannedRiskUnits: 5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "LEN",
            averagePrice: 61.98450959289191,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LEN",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 62,
                t: 1583505360000,
                order: {
                    filledQuantity: 4,
                    symbol: "LEN",
                    averagePrice: 61.98450959289191,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "LEN",
                    averagePrice: 58.324114472729626,
                    status: OrderStatus.filled
                },
                symbol: "LEN",
                price: 58.26,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1583760720000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LEN",
                    averagePrice: 55.78510232798453,
                    status: OrderStatus.filled
                },
                symbol: "LEN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1583760840000
            }
        ]
    },
    {
        symbol: "INCY",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 84.5,
        plannedStopPrice: 83,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "INCY",
            averagePrice: 84.0049260140385,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INCY",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84,
                t: 1573137360000,
                order: {
                    filledQuantity: 6,
                    symbol: "INCY",
                    averagePrice: 84.0049260140385,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "INCY",
                    averagePrice: 82.96258042777698,
                    status: OrderStatus.filled
                },
                symbol: "INCY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573148340000
            }
        ]
    },
    {
        symbol: "BXP",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 138,
        plannedStopPrice: 136,
        plannedQuantity: 5,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "BXP",
            averagePrice: 138.0070166135956,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BXP",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 138,
                t: 1573223760000,
                order: {
                    filledQuantity: 5,
                    symbol: "BXP",
                    averagePrice: 138.0070166135956,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BXP",
                    averagePrice: 136.06925856806245,
                    status: OrderStatus.filled
                },
                symbol: "BXP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573591380000
            }
        ]
    },
    {
        symbol: "WY",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 30.5,
        plannedStopPrice: 28.96269764821793,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0373023517820705,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "WY",
            averagePrice: 30.08249847860506,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WY",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 30,
                t: 1572964560000,
                order: {
                    filledQuantity: 6,
                    symbol: "WY",
                    averagePrice: 30.08249847860506,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "WY",
                    averagePrice: 29.014382186688316,
                    status: OrderStatus.filled
                },
                symbol: "WY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573657620000
            }
        ]
    },
    {
        symbol: "ES",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 79,
        plannedStopPrice: 80,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "ES",
            averagePrice: 78.90481342689898,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ES",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 79,
                t: 1573569360000,
                order: {
                    filledQuantity: 10,
                    symbol: "ES",
                    averagePrice: 78.90481342689898,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "ES",
                    averagePrice: 80.15987623813862,
                    status: OrderStatus.filled
                },
                symbol: "ES",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573659180000
            }
        ]
    },
    {
        symbol: "KHC",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 33,
        plannedStopPrice: 32,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "KHC",
            averagePrice: 33.00489058358025,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KHC",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 33,
                t: 1573569360000,
                order: {
                    filledQuantity: 10,
                    symbol: "KHC",
                    averagePrice: 33.00489058358025,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "KHC",
                    averagePrice: 32.010995171560936,
                    status: OrderStatus.filled
                },
                symbol: "KHC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573742520000
            }
        ]
    },
    {
        symbol: "AME",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 96.5,
        plannedStopPrice: 95,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "AME",
            averagePrice: 96.06199038675686,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AME",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 96,
                t: 1573482960000,
                order: {
                    filledQuantity: 6,
                    symbol: "AME",
                    averagePrice: 96.06199038675686,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "AME",
                    averagePrice: 97.43085759297333,
                    status: OrderStatus.filled
                },
                symbol: "AME",
                price: 97.4498,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1573758840000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "AME",
                    averagePrice: 99.0760634164417,
                    status: OrderStatus.filled
                },
                symbol: "AME",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574195400000
            }
        ]
    },
    {
        symbol: "ANET",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 193.5,
        plannedStopPrice: 198,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "ANET",
            averagePrice: 193.94036552325852,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANET",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 194,
                t: 1574260560000,
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 193.94036552325852,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 186.87920627858537,
                    status: OrderStatus.filled
                },
                symbol: "ANET",
                price: 186.82,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1574260620000
            }
        ]
    },
    {
        symbol: "INCY",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 87,
        plannedStopPrice: 84,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "INCY",
            averagePrice: 87.00036888857392,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INCY",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 87,
                t: 1574087760000,
                order: {
                    filledQuantity: 3,
                    symbol: "INCY",
                    averagePrice: 87.00036888857392,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "INCY",
                    averagePrice: 89.75884027306968,
                    status: OrderStatus.filled
                },
                symbol: "INCY",
                price: 89.76,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1574263500000
            }
        ]
    },
    {
        symbol: "APD",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 242,
        plannedStopPrice: 238,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "APD",
            averagePrice: 241.59560418605759,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "APD",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 241.5,
                t: 1574260560000,
                order: {
                    filledQuantity: 2,
                    symbol: "APD",
                    averagePrice: 241.59560418605759,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "APD",
                    averagePrice: 241.1597777732245,
                    status: OrderStatus.filled
                },
                symbol: "APD",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574264820000
            }
        ]
    },
    {
        symbol: "DOV",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 110,
        plannedStopPrice: 108,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "DOV",
            averagePrice: 109.55382353633023,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DOV",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 109.5,
                t: 1573050960000,
                order: {
                    filledQuantity: 5,
                    symbol: "DOV",
                    averagePrice: 109.55382353633023,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "DOV",
                    averagePrice: 107.94686564512003,
                    status: OrderStatus.filled
                },
                symbol: "DOV",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574273880000
            }
        ]
    },
    {
        symbol: "TWTR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 29,
        plannedStopPrice: 30,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "TWTR",
            averagePrice: 28.926444240999263,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TWTR",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 29,
                t: 1573482960000,
                order: {
                    filledQuantity: 10,
                    symbol: "TWTR",
                    averagePrice: 28.926444240999263,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "TWTR",
                    averagePrice: 30.123441310096727,
                    status: OrderStatus.filled
                },
                symbol: "TWTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1574351100000
            }
        ]
    },
    {
        symbol: "ANET",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 191.5,
        plannedStopPrice: 196,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "ANET",
            averagePrice: 192.92062533870126,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANET",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 193,
                t: 1574433360000,
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 192.92062533870126,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 196.66676421249147,
                    status: OrderStatus.filled
                },
                symbol: "ANET",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574692680000
            }
        ]
    },
    {
        symbol: "ANET",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 194.5,
        plannedStopPrice: 198,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "ANET",
            averagePrice: 194.93935073099937,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANET",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 195,
                t: 1575038160000,
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 194.93935073099937,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "ANET",
                    averagePrice: 191.65208507593172,
                    status: OrderStatus.filled
                },
                symbol: "ANET",
                price: 191.56,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1575299040000
            }
        ]
    },
    {
        symbol: "AES",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 17,
        plannedStopPrice: 15.98958845926332,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0104115407366798,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "AES",
            averagePrice: 17.043400390913185,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AES",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 17,
                t: 1572615360000,
                order: {
                    filledQuantity: 9,
                    symbol: "AES",
                    averagePrice: 17.043400390913185,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "AES",
                    averagePrice: 17.949971921709086,
                    status: OrderStatus.filled
                },
                symbol: "AES",
                price: 17.955,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1573490220000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AES",
                    averagePrice: 19.143656537910903,
                    status: OrderStatus.filled
                },
                symbol: "AES",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575992640000
            }
        ]
    },
    {
        symbol: "APH",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 103,
        plannedStopPrice: 100,
        plannedQuantity: 3,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "APH",
            averagePrice: 102.5212491214192,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "APH",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 102.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 3,
                    symbol: "APH",
                    averagePrice: 102.5212491214192,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "APH",
                    averagePrice: 105.1851153235146,
                    status: OrderStatus.filled
                },
                symbol: "APH",
                price: 105.28,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1576002960000
            }
        ]
    },
    {
        symbol: "TWTR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 31,
        plannedStopPrice: 32,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "TWTR",
            averagePrice: 30.957496459631514,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TWTR",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 31,
                t: 1575038160000,
                order: {
                    filledQuantity: 10,
                    symbol: "TWTR",
                    averagePrice: 30.957496459631514,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "TWTR",
                    averagePrice: 30.091878699397558,
                    status: OrderStatus.filled
                },
                symbol: "TWTR",
                price: 30.045,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1575300840000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "TWTR",
                    averagePrice: 32.04062345680757,
                    status: OrderStatus.filled
                },
                symbol: "TWTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576766040000
            }
        ]
    },
    {
        symbol: "AES",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 19,
        plannedStopPrice: 17.991738484419106,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0082615155808945,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "AES",
            averagePrice: 19.03371280711972,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AES",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 19,
                t: 1576506960000,
                order: {
                    filledQuantity: 9,
                    symbol: "AES",
                    averagePrice: 19.03371280711972,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "AES",
                    averagePrice: 19.902700274607106,
                    status: OrderStatus.filled
                },
                symbol: "AES",
                price: 19.95,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1576873740000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AES",
                    averagePrice: 19.851599364474584,
                    status: OrderStatus.filled
                },
                symbol: "AES",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1577128320000
            }
        ]
    },
    {
        symbol: "IFF",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 124.5,
        plannedStopPrice: 128,
        plannedQuantity: 2,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "IFF",
            averagePrice: 123.43895931942023,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IFF",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 123.5,
                t: 1577370960000,
                order: {
                    filledQuantity: 2,
                    symbol: "IFF",
                    averagePrice: 123.43895931942023,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "IFF",
                    averagePrice: 128.05660727363295,
                    status: OrderStatus.filled
                },
                symbol: "IFF",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1577461680000
            }
        ]
    },
    {
        symbol: "YUM",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 98.5,
        plannedStopPrice: 102,
        plannedQuantity: 2,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "YUM",
            averagePrice: 99.43317994396281,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "YUM",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 99.5,
                t: 1573223760000,
                order: {
                    filledQuantity: 2,
                    symbol: "YUM",
                    averagePrice: 99.43317994396281,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "YUM",
                    averagePrice: 102.07089575713833,
                    status: OrderStatus.filled
                },
                symbol: "YUM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1577464200000
            }
        ]
    },
    {
        symbol: "APH",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 107.5,
        plannedStopPrice: 106,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "APH",
            averagePrice: 107.59995760598814,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "APH",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 107.5,
                t: 1577370960000,
                order: {
                    filledQuantity: 6,
                    symbol: "APH",
                    averagePrice: 107.59995760598814,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "APH",
                    averagePrice: 108.55985909230513,
                    status: OrderStatus.filled
                },
                symbol: "APH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1577734800000
            }
        ]
    },
    {
        symbol: "INCY",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 87,
        plannedStopPrice: 89,
        plannedQuantity: 5,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "INCY",
            averagePrice: 86.42276218602863,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INCY",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 86.5,
                t: 1577975760000,
                order: {
                    filledQuantity: 5,
                    symbol: "INCY",
                    averagePrice: 86.42276218602863,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "INCY",
                    averagePrice: 76.04773638139007,
                    status: OrderStatus.filled
                },
                symbol: "INCY",
                price: 75.9626,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1578061860000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "INCY",
                    averagePrice: 76.45348548828163,
                    status: OrderStatus.filled
                },
                symbol: "INCY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1578061920000
            }
        ]
    },
    {
        symbol: "BURL",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 223.5,
        plannedStopPrice: 227,
        plannedQuantity: 2,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "BURL",
            averagePrice: 224.48154541666668,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BURL",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 224.5,
                t: 1579271760000,
                order: {
                    filledQuantity: 2,
                    symbol: "BURL",
                    averagePrice: 224.48154541666668,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BURL",
                    averagePrice: 192.0457362883979,
                    status: OrderStatus.filled
                },
                symbol: "BURL",
                price: 192.032,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1579271820000
            }
        ]
    },
    {
        symbol: "APH",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 109,
        plannedStopPrice: 108,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "APH",
            averagePrice: 109.52922873109424,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "APH",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 109.5,
                t: 1579012560000,
                order: {
                    filledQuantity: 10,
                    symbol: "APH",
                    averagePrice: 109.52922873109424,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "APH",
                    averagePrice: 109.2820189979322,
                    status: OrderStatus.filled
                },
                symbol: "APH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1579288260000
            }
        ]
    },
    {
        symbol: "INCY",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 80.5,
        plannedStopPrice: 84,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "INCY",
            averagePrice: 80.44384152919766,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INCY",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 80.5,
                t: 1579271760000,
                order: {
                    filledQuantity: 2,
                    symbol: "INCY",
                    averagePrice: 80.44384152919766,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "INCY",
                    averagePrice: 77.26777937659826,
                    status: OrderStatus.filled
                },
                symbol: "INCY",
                price: 77.22,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1579878120000
            }
        ]
    },
    {
        symbol: "WYNN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 133,
        plannedStopPrice: 137,
        plannedQuantity: 2,
        plannedRiskUnits: 8.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "WYNN",
            averagePrice: 128.45822844759329,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WYNN",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 128.5,
                t: 1581086160000,
                order: {
                    filledQuantity: 2,
                    symbol: "WYNN",
                    averagePrice: 128.45822844759329,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "WYNN",
                    averagePrice: 137.1346000904096,
                    status: OrderStatus.filled
                },
                symbol: "WYNN",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1581535380000
            }
        ]
    },
    {
        symbol: "CRM",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 169.5,
        plannedStopPrice: 177,
        plannedQuantity: 1,
        plannedRiskUnits: 5.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CRM",
            averagePrice: 171.40154866486117,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CRM",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 171.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 1,
                    symbol: "CRM",
                    averagePrice: 171.40154866486117,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CRM",
                    averagePrice: 159.93318090365116,
                    status: OrderStatus.filled
                },
                symbol: "CRM",
                price: 159.9,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583419020000
            }
        ]
    },
    {
        symbol: "WDAY",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 166.5,
        plannedStopPrice: 174,
        plannedQuantity: 1,
        plannedRiskUnits: 8,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "WDAY",
            averagePrice: 165.92118552126425,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WDAY",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 166,
                t: 1583418960000,
                order: {
                    filledQuantity: 1,
                    symbol: "WDAY",
                    averagePrice: 165.92118552126425,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "WDAY",
                    averagePrice: 158.83017206310882,
                    status: OrderStatus.filled
                },
                symbol: "WDAY",
                price: 158.767,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583506020000
            }
        ]
    },
    {
        symbol: "NLY",
        originalQuantity: 20,
        hasHardStop: false,
        plannedEntryPrice: 9.5,
        plannedStopPrice: 10,
        plannedQuantity: 20,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 20,
            symbol: "NLY",
            averagePrice: 9.498360917439257,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NLY",
                quantity: 20,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 9.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 20,
                    symbol: "NLY",
                    averagePrice: 9.498360917439257,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "NLY",
                    averagePrice: 9.100513969495303,
                    status: OrderStatus.filled
                },
                symbol: "NLY",
                price: 9.0188,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1583505060000
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "NLY",
                    averagePrice: 8.500174880560522,
                    status: OrderStatus.filled
                },
                symbol: "NLY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "ANET",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 196,
        plannedStopPrice: 205,
        plannedQuantity: 1,
        plannedRiskUnits: 13.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ANET",
            averagePrice: 191.4740531341037,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ANET",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 191.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 1,
                    symbol: "ANET",
                    averagePrice: 191.4740531341037,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ANET",
                    averagePrice: 179.493849095223,
                    status: OrderStatus.filled
                },
                symbol: "ANET",
                price: 179.43,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "CRM",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 168,
        plannedStopPrice: 176,
        plannedQuantity: 1,
        plannedRiskUnits: 11,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CRM",
            averagePrice: 164.91823803369843,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CRM",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 165,
                t: 1583505360000,
                order: {
                    filledQuantity: 1,
                    symbol: "CRM",
                    averagePrice: 164.91823803369843,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CRM",
                    averagePrice: 152.70798963855776,
                    status: OrderStatus.filled
                },
                symbol: "CRM",
                price: 152.66,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "BX",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 57,
        plannedStopPrice: 59,
        plannedQuantity: 5,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "BX",
            averagePrice: 54.4717011594464,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BX",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 54.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 5,
                    symbol: "BX",
                    averagePrice: 54.4717011594464,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "BX",
                    averagePrice: 47.526433758445094,
                    status: OrderStatus.filled
                },
                symbol: "BX",
                price: 47.48,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1583760660000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BX",
                    averagePrice: 47.36058677430035,
                    status: OrderStatus.filled
                },
                symbol: "BX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1583760720000
            }
        ]
    },
    {
        symbol: "SCCO",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 38,
        plannedStopPrice: 37,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "SCCO",
            averagePrice: 38.56416339262844,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SCCO",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 38.5,
                t: 1572964560000,
                order: {
                    filledQuantity: 10,
                    symbol: "SCCO",
                    averagePrice: 38.56416339262844,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "SCCO",
                    averagePrice: 37.06291962321111,
                    status: OrderStatus.filled
                },
                symbol: "SCCO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573052280000
            }
        ]
    },
    {
        symbol: "UNH",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 252,
        plannedStopPrice: 247,
        plannedQuantity: 2,
        plannedRiskUnits: 6,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "UNH",
            averagePrice: 253.0808395337589,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "UNH",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 253,
                t: 1573137360000,
                order: {
                    filledQuantity: 2,
                    symbol: "UNH",
                    averagePrice: 253.0808395337589,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "UNH",
                    averagePrice: 257.5803247610858,
                    status: OrderStatus.filled
                },
                symbol: "UNH",
                price: 257.6,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573223880000
            }
        ]
    },
    {
        symbol: "ADS",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 105,
        plannedStopPrice: 108,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "ADS",
            averagePrice: 104.90140504817937,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ADS",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 105,
                t: 1573223760000,
                order: {
                    filledQuantity: 3,
                    symbol: "ADS",
                    averagePrice: 104.90140504817937,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "ADS",
                    averagePrice: 108.31215761406096,
                    status: OrderStatus.filled
                },
                symbol: "ADS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1573225980000
            }
        ]
    },
    {
        symbol: "CI",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 187.5,
        plannedStopPrice: 183,
        plannedQuantity: 2,
        plannedRiskUnits: 4.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "CI",
            averagePrice: 187.56455234991282,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CI",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 187.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 2,
                    symbol: "CI",
                    averagePrice: 187.56455234991282,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CI",
                    averagePrice: 191.64665033704782,
                    status: OrderStatus.filled
                },
                symbol: "CI",
                price: 191.68,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573667640000
            }
        ]
    },
    {
        symbol: "ADS",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 106,
        plannedStopPrice: 109,
        plannedQuantity: 3,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "ADS",
            averagePrice: 106.94019203360735,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ADS",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 107,
                t: 1573742160000,
                order: {
                    filledQuantity: 3,
                    symbol: "ADS",
                    averagePrice: 106.94019203360735,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "ADS",
                    averagePrice: 104.14236914694416,
                    status: OrderStatus.filled
                },
                symbol: "ADS",
                price: 104.11,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1573828560000
            }
        ]
    },
    {
        symbol: "UNH",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 256,
        plannedStopPrice: 252,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "UNH",
            averagePrice: 256.00532762343994,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "UNH",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 256,
                t: 1573655760000,
                order: {
                    filledQuantity: 2,
                    symbol: "UNH",
                    averagePrice: 256.00532762343994,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "UNH",
                    averagePrice: 259.545382963095,
                    status: OrderStatus.filled
                },
                symbol: "UNH",
                price: 259.63,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573843200000
            }
        ]
    },
    {
        symbol: "PSA",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 211.5,
        plannedStopPrice: 215,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PSA",
            averagePrice: 211.48962943445838,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PSA",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 211.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 2,
                    symbol: "PSA",
                    averagePrice: 211.48962943445838,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PSA",
                    averagePrice: 215.46906003694872,
                    status: OrderStatus.filled
                },
                symbol: "PSA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574087820000
            }
        ]
    },
    {
        symbol: "EXPE",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 94,
        plannedStopPrice: 97,
        plannedQuantity: 3,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "EXPE",
            averagePrice: 95.43659891298819,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXPE",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 95.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 3,
                    symbol: "EXPE",
                    averagePrice: 95.43659891298819,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "EXPE",
                    averagePrice: 95.37245824199887,
                    status: OrderStatus.filled
                },
                symbol: "EXPE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1574091660000
            }
        ]
    },
    {
        symbol: "WBA",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 63,
        plannedStopPrice: 61,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "WBA",
            averagePrice: 62.54238261328951,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WBA",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 62.5,
                t: 1573742160000,
                order: {
                    filledQuantity: 5,
                    symbol: "WBA",
                    averagePrice: 62.54238261328951,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "WBA",
                    averagePrice: 62.045347136129806,
                    status: OrderStatus.filled
                },
                symbol: "WBA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574097240000
            }
        ]
    },
    {
        symbol: "MGM",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 31.5,
        plannedStopPrice: 29.97195476367931,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0280452363206898,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "MGM",
            averagePrice: 31.03969124537482,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGM",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 31,
                t: 1574087760000,
                order: {
                    filledQuantity: 6,
                    symbol: "MGM",
                    averagePrice: 31.03969124537482,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "MGM",
                    averagePrice: 31.99602082960873,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574188860000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 84.5,
        plannedStopPrice: 82.93713933155306,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0628606684469446,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LW",
            averagePrice: 84.09099646245232,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84,
                t: 1574260560000,
                order: {
                    filledQuantity: 6,
                    symbol: "LW",
                    averagePrice: 84.09099646245232,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "LW",
                    averagePrice: 83.70254171585425,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574281200000
            }
        ]
    },
    {
        symbol: "ADS",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 100,
        plannedStopPrice: 104,
        plannedQuantity: 2,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "ADS",
            averagePrice: 101.95364503872706,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ADS",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 102,
                t: 1574433360000,
                order: {
                    filledQuantity: 2,
                    symbol: "ADS",
                    averagePrice: 101.95364503872706,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "ADS",
                    averagePrice: 104.08213741042499,
                    status: OrderStatus.filled
                },
                symbol: "ADS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574434980000
            }
        ]
    },
    {
        symbol: "HAS",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 94.5,
        plannedStopPrice: 98,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "HAS",
            averagePrice: 94.93030447653561,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HAS",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 95,
                t: 1573482960000,
                order: {
                    filledQuantity: 2,
                    symbol: "HAS",
                    averagePrice: 94.93030447653561,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "HAS",
                    averagePrice: 98.73313327670377,
                    status: OrderStatus.filled
                },
                symbol: "HAS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574692260000
            }
        ]
    },
    {
        symbol: "BK",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 49.5,
        plannedStopPrice: 47.976725040252276,
        plannedQuantity: 6,
        plannedRiskUnits: 0.5232749597477238,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "BK",
            averagePrice: 48.53932256926968,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BK",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 48.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 6,
                    symbol: "BK",
                    averagePrice: 48.53932256926968,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "BK",
                    averagePrice: 47.96663031860429,
                    status: OrderStatus.filled
                },
                symbol: "BK",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1575393060000
            }
        ]
    },
    {
        symbol: "EXPE",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 99,
        plannedStopPrice: 101,
        plannedQuantity: 5,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "EXPE",
            averagePrice: 104.99333900904658,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXPE",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 105,
                t: 1575470160000,
                order: {
                    filledQuantity: 5,
                    symbol: "EXPE",
                    averagePrice: 104.99333900904658,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "EXPE",
                    averagePrice: 104.20763028837546,
                    status: OrderStatus.filled
                },
                symbol: "EXPE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575470400000
            }
        ]
    },
    {
        symbol: "ROL",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 37,
        plannedStopPrice: 35,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "ROL",
            averagePrice: 36.5327363111244,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ROL",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 36.5,
                t: 1574346960000,
                order: {
                    filledQuantity: 5,
                    symbol: "ROL",
                    averagePrice: 36.5327363111244,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "ROL",
                    averagePrice: 38.64258737036848,
                    status: OrderStatus.filled
                },
                symbol: "ROL",
                price: 38.68,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1574347020000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ROL",
                    averagePrice: 35.084708041083175,
                    status: OrderStatus.filled
                },
                symbol: "ROL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1575484800000
            }
        ]
    },
    {
        symbol: "MGM",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 32,
        plannedStopPrice: 30.98246422595542,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0175357740445783,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "MGM",
            averagePrice: 32.054374888918694,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGM",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 32,
                t: 1574692560000,
                order: {
                    filledQuantity: 9,
                    symbol: "MGM",
                    averagePrice: 32.054374888918694,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "MGM",
                    averagePrice: 32.175147311330555,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1575644220000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 83.5,
        plannedStopPrice: 82,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LW",
            averagePrice: 83.55150044679786,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 83.5,
                t: 1574692560000,
                order: {
                    filledQuantity: 6,
                    symbol: "LW",
                    averagePrice: 83.55150044679786,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LW",
                    averagePrice: 84.85666012394215,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 84.92,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1575471240000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LW",
                    averagePrice: 84.13846042967741,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1575993900000
            }
        ]
    },
    {
        symbol: "FRC",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 110,
        plannedStopPrice: 107,
        plannedQuantity: 3,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "FRC",
            averagePrice: 111.01979959663035,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FRC",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 111,
                t: 1572964560000,
                order: {
                    filledQuantity: 3,
                    symbol: "FRC",
                    averagePrice: 111.01979959663035,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "FRC",
                    averagePrice: 113.69093639928683,
                    status: OrderStatus.filled
                },
                symbol: "FRC",
                price: 113.76,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1576162200000
            }
        ]
    },
    {
        symbol: "USB",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 58,
        plannedStopPrice: 57,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "USB",
            averagePrice: 58.51711919259987,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "USB",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 58.5,
                t: 1572964560000,
                order: {
                    filledQuantity: 10,
                    symbol: "USB",
                    averagePrice: 58.51711919259987,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "USB",
                    averagePrice: 59.42880582822711,
                    status: OrderStatus.filled
                },
                symbol: "USB",
                price: 59.43,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1573137480000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "USB",
                    averagePrice: 60.58817146633766,
                    status: OrderStatus.filled
                },
                symbol: "USB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576181040000
            }
        ]
    },
    {
        symbol: "SCCO",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 38,
        plannedStopPrice: 36,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "SCCO",
            averagePrice: 37.51413133638806,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SCCO",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 37.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 5,
                    symbol: "SCCO",
                    averagePrice: 37.51413133638806,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "SCCO",
                    averagePrice: 39.36681552953432,
                    status: OrderStatus.filled
                },
                symbol: "SCCO",
                price: 39.37,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1575904320000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "SCCO",
                    averagePrice: 41.821922663280716,
                    status: OrderStatus.filled
                },
                symbol: "SCCO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1576184400000
            }
        ]
    },
    {
        symbol: "EXPE",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 114,
        plannedStopPrice: 111,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "EXPE",
            averagePrice: 114.01177240039486,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXPE",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 114,
                t: 1576247760000,
                order: {
                    filledQuantity: 3,
                    symbol: "EXPE",
                    averagePrice: 114.01177240039486,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "EXPE",
                    averagePrice: 137.0320712147267,
                    status: OrderStatus.filled
                },
                symbol: "EXPE",
                price: 137.1,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1576247820000
            }
        ]
    },
    {
        symbol: "EXPE",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 114.5,
        plannedStopPrice: 111,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "EXPE",
            averagePrice: 114.06471241443435,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXPE",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 114,
                t: 1576593360000,
                order: {
                    filledQuantity: 2,
                    symbol: "EXPE",
                    averagePrice: 114.06471241443435,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EXPE",
                    averagePrice: 110.98198051225259,
                    status: OrderStatus.filled
                },
                symbol: "EXPE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576679460000
            }
        ]
    },
    {
        symbol: "MGM",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 32,
        plannedStopPrice: 30.988155821300538,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0118441786994623,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "MGM",
            averagePrice: 32.0323949647472,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGM",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 32,
                t: 1575902160000,
                order: {
                    filledQuantity: 9,
                    symbol: "MGM",
                    averagePrice: 32.0323949647472,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "MGM",
                    averagePrice: 32.88518690995428,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 32.95,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1576249740000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MGM",
                    averagePrice: 33.5375053125153,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1577126340000
            }
        ]
    },
    {
        symbol: "FRC",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 117.5,
        plannedStopPrice: 115,
        plannedQuantity: 4,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "FRC",
            averagePrice: 118.01177080399546,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FRC",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 118,
                t: 1576852560000,
                order: {
                    filledQuantity: 4,
                    symbol: "FRC",
                    averagePrice: 118.01177080399546,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "FRC",
                    averagePrice: 117.58690776560104,
                    status: OrderStatus.filled
                },
                symbol: "FRC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1577802660000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 86,
        plannedStopPrice: 84,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "LW",
            averagePrice: 85.57148605215522,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 85.5,
                t: 1577198160000,
                order: {
                    filledQuantity: 5,
                    symbol: "LW",
                    averagePrice: 85.57148605215522,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LW",
                    averagePrice: 84.9565089051843,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1577803920000
            }
        ]
    },
    {
        symbol: "SCCO",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 43,
        plannedStopPrice: 42,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "SCCO",
            averagePrice: 43.07388364685944,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SCCO",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 43,
                t: 1577370960000,
                order: {
                    filledQuantity: 10,
                    symbol: "SCCO",
                    averagePrice: 43.07388364685944,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "SCCO",
                    averagePrice: 42.036783123785405,
                    status: OrderStatus.filled
                },
                symbol: "SCCO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1578065820000
            }
        ]
    },
    {
        symbol: "FRC",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 117.5,
        plannedStopPrice: 115,
        plannedQuantity: 4,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "FRC",
            averagePrice: 118.03589091230558,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FRC",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 118,
                t: 1577975760000,
                order: {
                    filledQuantity: 4,
                    symbol: "FRC",
                    averagePrice: 118.03589091230558,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "FRC",
                    averagePrice: 115.00608579139715,
                    status: OrderStatus.filled
                },
                symbol: "FRC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1578667440000
            }
        ]
    },
    {
        symbol: "MGM",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 33.5,
        plannedStopPrice: 32,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "MGM",
            averagePrice: 33.50453096824313,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGM",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 33.5,
                t: 1577370960000,
                order: {
                    filledQuantity: 6,
                    symbol: "MGM",
                    averagePrice: 33.50453096824313,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "MGM",
                    averagePrice: 33.30469657736944,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1578931380000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 91.5,
        plannedStopPrice: 89.9153550454235,
        plannedQuantity: 6,
        plannedRiskUnits: 0.584644954576504,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LW",
            averagePrice: 90.50981210194477,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 90.5,
                t: 1578926160000,
                order: {
                    filledQuantity: 6,
                    symbol: "LW",
                    averagePrice: 90.50981210194477,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LW",
                    averagePrice: 91.8768938265965,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 91.94,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1579104780000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LW",
                    averagePrice: 90.97754986333398,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1579283580000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 91.5,
        plannedStopPrice: 90,
        plannedQuantity: 6,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LW",
            averagePrice: 90.50311935198725,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 90.5,
                t: 1579617360000,
                order: {
                    filledQuantity: 6,
                    symbol: "LW",
                    averagePrice: 90.50311935198725,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LW",
                    averagePrice: 91.82418737328125,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 91.89,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1579704180000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LW",
                    averagePrice: 89.90225420405086,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580221860000
            }
        ]
    },
    {
        symbol: "TGT",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 115.5,
        plannedStopPrice: 118,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "TGT",
            averagePrice: 115.45734427843898,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TGT",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 115.5,
                t: 1580308560000,
                order: {
                    filledQuantity: 4,
                    symbol: "TGT",
                    averagePrice: 115.45734427843898,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "TGT",
                    averagePrice: 108.44724618045323,
                    status: OrderStatus.filled
                },
                symbol: "TGT",
                price: 108.4,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1580308620000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "TGT",
                    averagePrice: 110.47170424625429,
                    status: OrderStatus.filled
                },
                symbol: "TGT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580492940000
            }
        ]
    },
    {
        symbol: "BABA",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 204.5,
        plannedStopPrice: 209,
        plannedQuantity: 2,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "BABA",
            averagePrice: 208.42379949569946,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BABA",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 208.5,
                t: 1580740560000,
                order: {
                    filledQuantity: 2,
                    symbol: "BABA",
                    averagePrice: 208.42379949569946,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BABA",
                    averagePrice: 177.82826266420238,
                    status: OrderStatus.filled
                },
                symbol: "BABA",
                price: 177.8,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580740620000
            }
        ]
    },
    {
        symbol: "SCCO",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 38.5,
        plannedStopPrice: 39.03239865026725,
        plannedQuantity: 18,
        plannedRiskUnits: 1.0323986502672469,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "SCCO",
            averagePrice: 37.90278287289446,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SCCO",
                quantity: 18,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 38,
                t: 1580394960000,
                order: {
                    filledQuantity: 18,
                    symbol: "SCCO",
                    averagePrice: 37.90278287289446,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 18,
                    symbol: "SCCO",
                    averagePrice: 39.584196611326625,
                    status: OrderStatus.filled
                },
                symbol: "SCCO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 18,
                t: 1580826660000
            }
        ]
    },
    {
        symbol: "SLB",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 33,
        plannedStopPrice: 34,
        plannedQuantity: 10,
        plannedRiskUnits: 0,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "SLB",
            averagePrice: 33.95828744681578,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SLB",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 34,
                t: 1580826960000,
                order: {
                    filledQuantity: 10,
                    symbol: "SLB",
                    averagePrice: 33.95828744681578,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "SLB",
                    averagePrice: 34.65744044527936,
                    status: OrderStatus.filled
                },
                symbol: "SLB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1580827020000
            }
        ]
    },
    {
        symbol: "MGM",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 31,
        plannedStopPrice: 32,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "MGM",
            averagePrice: 30.46405448069573,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGM",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 30.5,
                t: 1580394960000,
                order: {
                    filledQuantity: 10,
                    symbol: "MGM",
                    averagePrice: 30.46405448069573,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "MGM",
                    averagePrice: 32.02342400172136,
                    status: OrderStatus.filled
                },
                symbol: "MGM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1580827260000
            }
        ]
    },
    {
        symbol: "CXO",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 75,
        plannedStopPrice: 77,
        plannedQuantity: 5,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CXO",
            averagePrice: 76.49968081058901,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CXO",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76.5,
                t: 1580826960000,
                order: {
                    filledQuantity: 5,
                    symbol: "CXO",
                    averagePrice: 76.49968081058901,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CXO",
                    averagePrice: 70.90743057341722,
                    status: OrderStatus.filled
                },
                symbol: "CXO",
                price: 70.85,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1580827020000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CXO",
                    averagePrice: 77.07113961272675,
                    status: OrderStatus.filled
                },
                symbol: "CXO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1580829720000
            }
        ]
    },
    {
        symbol: "TGT",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 117.5,
        plannedStopPrice: 119,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "TGT",
            averagePrice: 117.96630791295456,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TGT",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 118,
                t: 1581690960000,
                order: {
                    filledQuantity: 6,
                    symbol: "TGT",
                    averagePrice: 117.96630791295456,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "TGT",
                    averagePrice: 107.86958943956927,
                    status: OrderStatus.filled
                },
                symbol: "TGT",
                price: 107.84,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1581691020000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "TGT",
                    averagePrice: 114.93314746886065,
                    status: OrderStatus.filled
                },
                symbol: "TGT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582554660000
            }
        ]
    },
    {
        symbol: "CVE",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 9,
        plannedStopPrice: 10.011127689427951,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0111276894279513,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CVE",
            averagePrice: 8.912142446031659,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CVE",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 9,
                t: 1580394960000,
                order: {
                    filledQuantity: 9,
                    symbol: "CVE",
                    averagePrice: 8.912142446031659,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "CVE",
                    averagePrice: 8.009451140123108,
                    status: OrderStatus.filled
                },
                symbol: "CVE",
                price: 8,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1582742100000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CVE",
                    averagePrice: 6.925942278720403,
                    status: OrderStatus.filled
                },
                symbol: "CVE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1583349420000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 86,
        plannedStopPrice: 89.12266044874167,
        plannedQuantity: 3,
        plannedRiskUnits: 2.1226604487416694,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "LW",
            averagePrice: 86.96655935914376,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 87,
                t: 1583418960000,
                order: {
                    filledQuantity: 3,
                    symbol: "LW",
                    averagePrice: 86.96655935914376,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "LW",
                    averagePrice: 77.94449646484958,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 77.845,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1583419020000
            }
        ]
    },
    {
        symbol: "LW",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 86,
        plannedStopPrice: 89.07467652460717,
        plannedQuantity: 3,
        plannedRiskUnits: 6.57467652460717,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "LW",
            averagePrice: 82.42603172124139,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LW",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 82.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 3,
                    symbol: "LW",
                    averagePrice: 82.42603172124139,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "LW",
                    averagePrice: 79.28144948832283,
                    status: OrderStatus.filled
                },
                symbol: "LW",
                price: 79.23,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "CVE",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 6.5,
        plannedStopPrice: 8.015564117812215,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5155641178122146,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "CVE",
            averagePrice: 6.4477338854805035,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CVE",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 6.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 6,
                    symbol: "CVE",
                    averagePrice: 6.4477338854805035,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "CVE",
                    averagePrice: 3.155161165224696,
                    status: OrderStatus.filled
                },
                symbol: "CVE",
                price: 3.08,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1583760720000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CVE",
                    averagePrice: 3.117470783558796,
                    status: OrderStatus.filled
                },
                symbol: "CVE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1583760780000
            }
        ]
    },
    {
        symbol: "ORLY",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 440,
        plannedStopPrice: 433,
        plannedQuantity: 1,
        plannedRiskUnits: 6,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ORLY",
            averagePrice: 439.0358097851341,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ORLY",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 439,
                t: 1572878160000,
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 439.0358097851341,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 432.4748360152667,
                    status: OrderStatus.filled
                },
                symbol: "ORLY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1573051500000
            }
        ]
    },
    {
        symbol: "VLO",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 101.5,
        plannedStopPrice: 100,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "VLO",
            averagePrice: 101.0022100145575,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VLO",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 101,
                t: 1573223760000,
                order: {
                    filledQuantity: 6,
                    symbol: "VLO",
                    averagePrice: 101.0022100145575,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "VLO",
                    averagePrice: 100.01265204783651,
                    status: OrderStatus.filled
                },
                symbol: "VLO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573225680000
            }
        ]
    },
    {
        symbol: "JBHT",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 121.5,
        plannedStopPrice: 119,
        plannedQuantity: 4,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "JBHT",
            averagePrice: 119.52937068656988,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "JBHT",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 119.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 4,
                    symbol: "JBHT",
                    averagePrice: 119.52937068656988,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "JBHT",
                    averagePrice: 118.98561257504367,
                    status: OrderStatus.filled
                },
                symbol: "JBHT",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1573483320000
            }
        ]
    },
    {
        symbol: "PCAR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 80,
        plannedStopPrice: 79,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "PCAR",
            averagePrice: 79.52439357452464,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PCAR",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 79.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 10,
                    symbol: "PCAR",
                    averagePrice: 79.52439357452464,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "PCAR",
                    averagePrice: 78.76261676421313,
                    status: OrderStatus.filled
                },
                symbol: "PCAR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "SBAC",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 227.5,
        plannedStopPrice: 233,
        plannedQuantity: 1,
        plannedRiskUnits: 5.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "SBAC",
            averagePrice: 227.41772375600965,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SBAC",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 227.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "SBAC",
                    averagePrice: 227.41772375600965,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "SBAC",
                    averagePrice: 233.4057510929295,
                    status: OrderStatus.filled
                },
                symbol: "SBAC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1573743540000
            }
        ]
    },
    {
        symbol: "ORLY",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 441,
        plannedStopPrice: 435,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ORLY",
            averagePrice: 440.0640676021107,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ORLY",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 440,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 440.0640676021107,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 446.2842011080625,
                    status: OrderStatus.filled
                },
                symbol: "ORLY",
                price: 446.36,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574087460000
            }
        ]
    },
    {
        symbol: "CTXS",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 109,
        plannedStopPrice: 107,
        plannedQuantity: 5,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CTXS",
            averagePrice: 109.02174467509869,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CTXS",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 109,
                t: 1572615360000,
                order: {
                    filledQuantity: 5,
                    symbol: "CTXS",
                    averagePrice: 109.02174467509869,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CTXS",
                    averagePrice: 110.77154172579664,
                    status: OrderStatus.filled
                },
                symbol: "CTXS",
                price: 110.85,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1573483860000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CTXS",
                    averagePrice: 113.18112556236257,
                    status: OrderStatus.filled
                },
                symbol: "CTXS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574176260000
            }
        ]
    },
    {
        symbol: "VLO",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 101,
        plannedStopPrice: 98,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "VLO",
            averagePrice: 101.09748756950658,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VLO",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 101,
                t: 1573828560000,
                order: {
                    filledQuantity: 3,
                    symbol: "VLO",
                    averagePrice: 101.09748756950658,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "VLO",
                    averagePrice: 98.01592954666269,
                    status: OrderStatus.filled
                },
                symbol: "VLO",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1574178540000
            }
        ]
    },
    {
        symbol: "IP",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 46,
        plannedStopPrice: 45,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "IP",
            averagePrice: 45.508790041580866,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IP",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 45.5,
                t: 1574087760000,
                order: {
                    filledQuantity: 10,
                    symbol: "IP",
                    averagePrice: 45.508790041580866,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "IP",
                    averagePrice: 46.071604462392905,
                    status: OrderStatus.filled
                },
                symbol: "IP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1574192340000
            }
        ]
    },
    {
        symbol: "BMRN",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 76,
        plannedStopPrice: 73,
        plannedQuantity: 3,
        plannedRiskUnits: 3,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "BMRN",
            averagePrice: 76.05622273708126,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BMRN",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76,
                t: 1574174160000,
                order: {
                    filledQuantity: 3,
                    symbol: "BMRN",
                    averagePrice: 76.05622273708126,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "BMRN",
                    averagePrice: 78.78676752180799,
                    status: OrderStatus.filled
                },
                symbol: "BMRN",
                price: 78.8,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1574264760000
            }
        ]
    },
    {
        symbol: "SLF",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 46,
        plannedStopPrice: 45,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "SLF",
            averagePrice: 46.00615924968171,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "SLF",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 46,
                t: 1573569360000,
                order: {
                    filledQuantity: 10,
                    symbol: "SLF",
                    averagePrice: 46.00615924968171,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "SLF",
                    averagePrice: 45.001612968109384,
                    status: OrderStatus.filled
                },
                symbol: "SLF",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1574784480000
            }
        ]
    },
    {
        symbol: "ORLY",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 438.5,
        plannedStopPrice: 432,
        plannedQuantity: 1,
        plannedRiskUnits: 8,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "ORLY",
            averagePrice: 440.0818783755687,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ORLY",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 440,
                t: 1574692560000,
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 440.0818783755687,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "ORLY",
                    averagePrice: 445.86182377473193,
                    status: OrderStatus.filled
                },
                symbol: "ORLY",
                price: 445.96,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574867820000
            }
        ]
    },
    {
        symbol: "IEP",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 62.5,
        plannedStopPrice: 65,
        plannedQuantity: 4,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "IEP",
            averagePrice: 62.98894419751713,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IEP",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 63,
                t: 1574692560000,
                order: {
                    filledQuantity: 4,
                    symbol: "IEP",
                    averagePrice: 62.98894419751713,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "IEP",
                    averagePrice: 63.20224115295999,
                    status: OrderStatus.filled
                },
                symbol: "IEP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1575050460000
            }
        ]
    },
    {
        symbol: "GIB",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 82,
        plannedStopPrice: 81,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "GIB",
            averagePrice: 81.55211644184384,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GIB",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 81.5,
                t: 1574433360000,
                order: {
                    filledQuantity: 10,
                    symbol: "GIB",
                    averagePrice: 81.55211644184384,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "GIB",
                    averagePrice: 82.38180570565942,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 82.46,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1574795640000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "GIB",
                    averagePrice: 82.81402885618517,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575059460000
            }
        ]
    },
    {
        symbol: "IEP",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 63,
        plannedStopPrice: 64,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "IEP",
            averagePrice: 62.943321384143495,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IEP",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 63,
                t: 1575297360000,
                order: {
                    filledQuantity: 10,
                    symbol: "IEP",
                    averagePrice: 62.943321384143495,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "IEP",
                    averagePrice: 61.94967007306315,
                    status: OrderStatus.filled
                },
                symbol: "IEP",
                price: 61.88,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1575383460000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "IEP",
                    averagePrice: 60.788474511863996,
                    status: OrderStatus.filled
                },
                symbol: "IEP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575384720000
            }
        ]
    },
    {
        symbol: "PANW",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 227,
        plannedStopPrice: 233,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "PANW",
            averagePrice: 228.99371541408377,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PANW",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 229,
                t: 1575642960000,
                order: {
                    filledQuantity: 1,
                    symbol: "PANW",
                    averagePrice: 228.99371541408377,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "PANW",
                    averagePrice: 229.96524335052416,
                    status: OrderStatus.filled
                },
                symbol: "PANW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1575643020000
            }
        ]
    },
    {
        symbol: "PANW",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 224,
        plannedStopPrice: 229,
        plannedQuantity: 2,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PANW",
            averagePrice: 226.48654667045412,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PANW",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 226.5,
                t: 1575988560000,
                order: {
                    filledQuantity: 2,
                    symbol: "PANW",
                    averagePrice: 226.48654667045412,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PANW",
                    averagePrice: 229.2220147732622,
                    status: OrderStatus.filled
                },
                symbol: "PANW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576164000000
            }
        ]
    },
    {
        symbol: "PPL",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 34,
        plannedStopPrice: 32.97027348948468,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5297265105153173,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "PPL",
            averagePrice: 33.5516474873879,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PPL",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 33.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 9,
                    symbol: "PPL",
                    averagePrice: 33.5516474873879,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "PPL",
                    averagePrice: 34.43774892347517,
                    status: OrderStatus.filled
                },
                symbol: "PPL",
                price: 34.487,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1575484080000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PPL",
                    averagePrice: 35.657212004787226,
                    status: OrderStatus.filled
                },
                symbol: "PPL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576258620000
            }
        ]
    },
    {
        symbol: "PANW",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 225.5,
        plannedStopPrice: 230,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "PANW",
            averagePrice: 226.48016479435185,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PANW",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 226.5,
                t: 1576506960000,
                order: {
                    filledQuantity: 2,
                    symbol: "PANW",
                    averagePrice: 226.48016479435185,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PANW",
                    averagePrice: 230.02437760201326,
                    status: OrderStatus.filled
                },
                symbol: "PANW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1576523400000
            }
        ]
    },
    {
        symbol: "GIB",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 83,
        plannedStopPrice: 81,
        plannedQuantity: 5,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "GIB",
            averagePrice: 83.0138367572714,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GIB",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 83,
                t: 1575556560000,
                order: {
                    filledQuantity: 5,
                    symbol: "GIB",
                    averagePrice: 83.0138367572714,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "GIB",
                    averagePrice: 84.8158970741453,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 84.87,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1576871460000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "GIB",
                    averagePrice: 83.87492199878075,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1577716260000
            }
        ]
    },
    {
        symbol: "IEP",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 61.5,
        plannedStopPrice: 64,
        plannedQuantity: 4,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "IEP",
            averagePrice: 61.485694501972475,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IEP",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 61.5,
                t: 1576679760000,
                order: {
                    filledQuantity: 4,
                    symbol: "IEP",
                    averagePrice: 61.485694501972475,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "IEP",
                    averagePrice: 62.60761410338634,
                    status: OrderStatus.filled
                },
                symbol: "IEP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1577716260000
            }
        ]
    },
    {
        symbol: "GIB",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 84,
        plannedStopPrice: 83,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "GIB",
            averagePrice: 84.09702504692764,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GIB",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84,
                t: 1577975760000,
                order: {
                    filledQuantity: 10,
                    symbol: "GIB",
                    averagePrice: 84.09702504692764,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "GIB",
                    averagePrice: 85.02749018274244,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 85.04,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1578494880000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "GIB",
                    averagePrice: 86.28458660620326,
                    status: OrderStatus.filled
                },
                symbol: "GIB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1578580560000
            }
        ]
    },
    {
        symbol: "EOG",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 74,
        plannedStopPrice: 76,
        plannedQuantity: 5,
        plannedRiskUnits: 2.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "EOG",
            averagePrice: 73.44110735690063,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EOG",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 73.5,
                t: 1581345360000,
                order: {
                    filledQuantity: 5,
                    symbol: "EOG",
                    averagePrice: 73.44110735690063,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "EOG",
                    averagePrice: 69.94662381090082,
                    status: OrderStatus.filled
                },
                symbol: "EOG",
                price: 69.9205,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1581345420000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "EOG",
                    averagePrice: 76.74475911401456,
                    status: OrderStatus.filled
                },
                symbol: "EOG",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1581517860000
            }
        ]
    },
    {
        symbol: "VRSN",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 204.5,
        plannedStopPrice: 209,
        plannedQuantity: 2,
        plannedRiskUnits: 4.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "VRSN",
            averagePrice: 204.42047524590384,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VRSN",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 204.5,
                t: 1581518160000,
                order: {
                    filledQuantity: 2,
                    symbol: "VRSN",
                    averagePrice: 204.42047524590384,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "VRSN",
                    averagePrice: 188.51715374272223,
                    status: OrderStatus.filled
                },
                symbol: "VRSN",
                price: 188.43,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1581518220000
            }
        ]
    },
    {
        symbol: "UDR",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 50.5,
        plannedStopPrice: 48.98184944847768,
        plannedQuantity: 6,
        plannedRiskUnits: 1.018150551522318,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "UDR",
            averagePrice: 50.08316206850033,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "UDR",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 50,
                t: 1582209360000,
                order: {
                    filledQuantity: 6,
                    symbol: "UDR",
                    averagePrice: 50.08316206850033,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "UDR",
                    averagePrice: 49.024941499384155,
                    status: OrderStatus.filled
                },
                symbol: "UDR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1582750800000
            }
        ]
    },
    {
        symbol: "CPRT",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 83.5,
        plannedStopPrice: 87.14383927554593,
        plannedQuantity: 2,
        plannedRiskUnits: 3.143839275545929,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "CPRT",
            averagePrice: 83.90910566808122,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CPRT",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84,
                t: 1583418960000,
                order: {
                    filledQuantity: 2,
                    symbol: "CPRT",
                    averagePrice: 83.90910566808122,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CPRT",
                    averagePrice: 80.39183448285458,
                    status: OrderStatus.filled
                },
                symbol: "CPRT",
                price: 80.32,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583505120000
            }
        ]
    },
    {
        symbol: "MGA",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 57,
        plannedStopPrice: 56,
        plannedQuantity: 10,
        plannedRiskUnits: 0,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "MGA",
            averagePrice: 56.07183850073367,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MGA",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 56,
                t: 1573223760000,
                order: {
                    filledQuantity: 10,
                    symbol: "MGA",
                    averagePrice: 56.07183850073367,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "MGA",
                    averagePrice: 55.90601522126575,
                    status: OrderStatus.filled
                },
                symbol: "MGA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573482780000
            }
        ]
    },
    {
        symbol: "BIIB",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 290.5,
        plannedStopPrice: 283,
        plannedQuantity: 1,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BIIB",
            averagePrice: 287.0993295961005,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIIB",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 287,
                t: 1573223760000,
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 287.0993295961005,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 293.9058132164996,
                    status: OrderStatus.filled
                },
                symbol: "BIIB",
                price: 293.91,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573483680000
            }
        ]
    },
    {
        symbol: "BAM",
        originalQuantity: 20,
        hasHardStop: false,
        plannedEntryPrice: 56.5,
        plannedStopPrice: 56,
        plannedQuantity: 20,
        plannedRiskUnits: 28.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 20,
            symbol: "BAM",
            averagePrice: 84.56234642039506,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAM",
                quantity: 20,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 20,
                    symbol: "BAM",
                    averagePrice: 84.56234642039506,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "BAM",
                    averagePrice: 84.942365675863,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 85.02,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1573483920000
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BAM",
                    averagePrice: 85.62253050887158,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573486320000
            }
        ]
    },
    {
        symbol: "CM",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 87,
        plannedStopPrice: 86,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "CM",
            averagePrice: 87.04750529117244,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CM",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 87,
                t: 1573050960000,
                order: {
                    filledQuantity: 10,
                    symbol: "CM",
                    averagePrice: 87.04750529117244,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "CM",
                    averagePrice: 85.58142584346108,
                    status: OrderStatus.filled
                },
                symbol: "CM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1573592400000
            }
        ]
    },
    {
        symbol: "BIIB",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 295,
        plannedStopPrice: 288,
        plannedQuantity: 1,
        plannedRiskUnits: 8,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BIIB",
            averagePrice: 296.0383566599389,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIIB",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 296,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 296.0383566599389,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 287.60749198631044,
                    status: OrderStatus.filled
                },
                symbol: "BIIB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "CHTR",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 475.5,
        plannedStopPrice: 468,
        plannedQuantity: 1,
        plannedRiskUnits: 6.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CHTR",
            averagePrice: 474.5478687577837,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHTR",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 474.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 474.5478687577837,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 481.30158326704236,
                    status: OrderStatus.filled
                },
                symbol: "CHTR",
                price: 481.36,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573664040000
            }
        ]
    },
    {
        symbol: "CP",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 235,
        plannedStopPrice: 231,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "CP",
            averagePrice: 235.00715267246363,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CP",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 235,
                t: 1573569360000,
                order: {
                    filledQuantity: 2,
                    symbol: "CP",
                    averagePrice: 235.00715267246363,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CP",
                    averagePrice: 238.59312167674284,
                    status: OrderStatus.filled
                },
                symbol: "CP",
                price: 238.62,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573665540000
            }
        ]
    },
    {
        symbol: "EMR",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 74,
        plannedStopPrice: 73,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "EMR",
            averagePrice: 73.52902559804137,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EMR",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 73.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 10,
                    symbol: "EMR",
                    averagePrice: 73.52902559804137,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "EMR",
                    averagePrice: 74.4115797159412,
                    status: OrderStatus.filled
                },
                symbol: "EMR",
                price: 74.43,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1573572540000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EMR",
                    averagePrice: 73.03450906048023,
                    status: OrderStatus.filled
                },
                symbol: "EMR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1573741860000
            }
        ]
    },
    {
        symbol: "BLK",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 489,
        plannedStopPrice: 482,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BLK",
            averagePrice: 487.052863584608,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BLK",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 487,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "BLK",
                    averagePrice: 487.052863584608,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BLK",
                    averagePrice: 481.86572081214564,
                    status: OrderStatus.filled
                },
                symbol: "BLK",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1573750020000
            }
        ]
    },
    {
        symbol: "LRCX",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 273.5,
        plannedStopPrice: 267,
        plannedQuantity: 1,
        plannedRiskUnits: 4.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "LRCX",
            averagePrice: 271.58312943898153,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LRCX",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 271.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 1,
                    symbol: "LRCX",
                    averagePrice: 271.58312943898153,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LRCX",
                    averagePrice: 278.18809954391924,
                    status: OrderStatus.filled
                },
                symbol: "LRCX",
                price: 278.25,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573765200000
            }
        ]
    },
    {
        symbol: "HUM",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 320,
        plannedStopPrice: 313,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "HUM",
            averagePrice: 318.07197584388393,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HUM",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 318,
                t: 1573569360000,
                order: {
                    filledQuantity: 1,
                    symbol: "HUM",
                    averagePrice: 318.07197584388393,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "HUM",
                    averagePrice: 324.3284648985708,
                    status: OrderStatus.filled
                },
                symbol: "HUM",
                price: 324.39,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1573843020000
            }
        ]
    },
    {
        symbol: "HPQ",
        originalQuantity: 19,
        hasHardStop: false,
        plannedEntryPrice: 20.5,
        plannedStopPrice: 19.978819818389344,
        plannedQuantity: 19,
        plannedRiskUnits: 0.02118018161065649,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 19,
            symbol: "HPQ",
            averagePrice: 20.064709674304698,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "HPQ",
                quantity: 19,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 20,
                t: 1574087760000,
                order: {
                    filledQuantity: 19,
                    symbol: "HPQ",
                    averagePrice: 20.064709674304698,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 19,
                    symbol: "HPQ",
                    averagePrice: 19.987335667781934,
                    status: OrderStatus.filled
                },
                symbol: "HPQ",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 19,
                t: 1574088360000
            }
        ]
    },
    {
        symbol: "CHA",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 39,
        plannedStopPrice: 40.0147005248804,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5147005248804035,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CHA",
            averagePrice: 39.41049878339447,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHA",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 39.5,
                t: 1574087760000,
                order: {
                    filledQuantity: 9,
                    symbol: "CHA",
                    averagePrice: 39.41049878339447,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "CHA",
                    averagePrice: 40.484081189140824,
                    status: OrderStatus.filled
                },
                symbol: "CHA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1574110800000
            }
        ]
    },
    {
        symbol: "CTL",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 15,
        plannedStopPrice: 13.97905398397928,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0209460160207193,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CTL",
            averagePrice: 15.02134591458327,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CTL",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 15,
                t: 1574087760000,
                order: {
                    filledQuantity: 9,
                    symbol: "CTL",
                    averagePrice: 15.02134591458327,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "CTL",
                    averagePrice: 15.160046609822233,
                    status: OrderStatus.filled
                },
                symbol: "CTL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1574174220000
            }
        ]
    },
    {
        symbol: "BIIB",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 283.5,
        plannedStopPrice: 275,
        plannedQuantity: 1,
        plannedRiskUnits: 10,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BIIB",
            averagePrice: 285.0806209856015,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIIB",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 285,
                t: 1574174160000,
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 285.0806209856015,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 295.92474146202585,
                    status: OrderStatus.filled
                },
                symbol: "BIIB",
                price: 295.953,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574189760000
            }
        ]
    },
    {
        symbol: "ZBH",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 146,
        plannedStopPrice: 144,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "ZBH",
            averagePrice: 145.03167738172453,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ZBH",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 145,
                t: 1574260560000,
                order: {
                    filledQuantity: 5,
                    symbol: "ZBH",
                    averagePrice: 145.03167738172453,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "ZBH",
                    averagePrice: 143.9837664672076,
                    status: OrderStatus.filled
                },
                symbol: "ZBH",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574265720000
            }
        ]
    },
    {
        symbol: "BLK",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 488,
        plannedStopPrice: 482,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BLK",
            averagePrice: 487.034886067103,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BLK",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 487,
                t: 1574692560000,
                order: {
                    filledQuantity: 1,
                    symbol: "BLK",
                    averagePrice: 487.034886067103,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BLK",
                    averagePrice: 492.4612974039132,
                    status: OrderStatus.filled
                },
                symbol: "BLK",
                price: 492.47,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574696400000
            }
        ]
    },
    {
        symbol: "CHTR",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 469.5,
        plannedStopPrice: 462,
        plannedQuantity: 1,
        plannedRiskUnits: 6,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CHTR",
            averagePrice: 468.0421606366328,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHTR",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 468,
                t: 1574865360000,
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 468.0421606366328,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 476.38731878941184,
                    status: OrderStatus.filled
                },
                symbol: "CHTR",
                price: 476.48,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1574865420000
            }
        ]
    },
    {
        symbol: "BAM",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 57,
        plannedStopPrice: 56,
        plannedQuantity: 10,
        plannedRiskUnits: 29.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "BAM",
            averagePrice: 85.50131126298363,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAM",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 85.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 10,
                    symbol: "BAM",
                    averagePrice: 85.50131126298363,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "BAM",
                    averagePrice: 87.28152475103255,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 87.375,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1573678800000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BAM",
                    averagePrice: 87.5975425020233,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574888400000
            }
        ]
    },
    {
        symbol: "CHA",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 39,
        plannedStopPrice: 40.01632709842772,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5163270984277233,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CHA",
            averagePrice: 39.41241415725859,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHA",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 39.5,
                t: 1574433360000,
                order: {
                    filledQuantity: 9,
                    symbol: "CHA",
                    averagePrice: 39.41241415725859,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 7,
                    symbol: "CHA",
                    averagePrice: 38.303334841826825,
                    status: OrderStatus.filled
                },
                symbol: "CHA",
                price: 38.25,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 7,
                t: 1574888400000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "CHA",
                    averagePrice: 37.79120324418494,
                    status: OrderStatus.filled
                },
                symbol: "CHA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575059460000
            }
        ]
    },
    {
        symbol: "CHTR",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 473.5,
        plannedStopPrice: 466,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CHTR",
            averagePrice: 471.0408085890247,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHTR",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 471,
                t: 1575297360000,
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 471.0408085890247,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CHTR",
                    averagePrice: 465.91360703616635,
                    status: OrderStatus.filled
                },
                symbol: "CHTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1575388260000
            }
        ]
    },
    {
        symbol: "BIIB",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 294.5,
        plannedStopPrice: 288,
        plannedQuantity: 1,
        plannedRiskUnits: 3.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "BIIB",
            averagePrice: 291.5006065867817,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIIB",
                quantity: 1,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 291.5,
                t: 1575470160000,
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 291.5006065867817,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BIIB",
                    averagePrice: 287.7633461690513,
                    status: OrderStatus.filled
                },
                symbol: "BIIB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1575558180000
            }
        ]
    },
    {
        symbol: "CHA",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 38,
        plannedStopPrice: 39.01289771381038,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5128977138103821,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CHA",
            averagePrice: 38.4377107735359,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHA",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 38.5,
                t: 1575988560000,
                order: {
                    filledQuantity: 9,
                    symbol: "CHA",
                    averagePrice: 38.4377107735359,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "CHA",
                    averagePrice: 39.0994434080111,
                    status: OrderStatus.filled
                },
                symbol: "CHA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1576077420000
            }
        ]
    },
    {
        symbol: "CDNS",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 65.5,
        plannedStopPrice: 68,
        plannedQuantity: 4,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "CDNS",
            averagePrice: 66.44749224009317,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDNS",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 66.5,
                t: 1575642960000,
                order: {
                    filledQuantity: 4,
                    symbol: "CDNS",
                    averagePrice: 66.44749224009317,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CDNS",
                    averagePrice: 68.08124753193964,
                    status: OrderStatus.filled
                },
                symbol: "CDNS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1576259820000
            }
        ]
    },
    {
        symbol: "BAM",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 58.5,
        plannedStopPrice: 56.9754010382648,
        plannedQuantity: 6,
        plannedRiskUnits: 31.0245989617352,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "BAM",
            averagePrice: 88.07812323451311,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAM",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 88,
                t: 1575642960000,
                order: {
                    filledQuantity: 6,
                    symbol: "BAM",
                    averagePrice: 88.07812323451311,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BAM",
                    averagePrice: 89.3958590644701,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 89.49,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1578930120000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BAM",
                    averagePrice: 91.2323493799615,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1579118040000
            }
        ]
    },
    {
        symbol: "TMUS",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 82.5,
        plannedStopPrice: 81.96340788636134,
        plannedQuantity: 18,
        plannedRiskUnits: 0.5365921136386618,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "TMUS",
            averagePrice: 82.53386179695214,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TMUS",
                quantity: 18,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 82.5,
                t: 1579876560000,
                order: {
                    filledQuantity: 18,
                    symbol: "TMUS",
                    averagePrice: 82.53386179695214,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 18,
                    symbol: "TMUS",
                    averagePrice: 81.98170928078652,
                    status: OrderStatus.filled
                },
                symbol: "TMUS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 18,
                t: 1579889520000
            }
        ]
    },
    {
        symbol: "WPC",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 84.5,
        plannedStopPrice: 83,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "WPC",
            averagePrice: 84.54169916995595,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WPC",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 84.5,
                t: 1580394960000,
                order: {
                    filledQuantity: 6,
                    symbol: "WPC",
                    averagePrice: 84.54169916995595,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "WPC",
                    averagePrice: 87.67081437186827,
                    status: OrderStatus.filled
                },
                symbol: "WPC",
                price: 87.742,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1580395020000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "WPC",
                    averagePrice: 87.6411852837275,
                    status: OrderStatus.filled
                },
                symbol: "WPC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582312440000
            }
        ]
    },
    {
        symbol: "TRI",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 76.5,
        plannedStopPrice: 80,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "TRI",
            averagePrice: 76.46387064903597,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "TRI",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 76.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 2,
                    symbol: "TRI",
                    averagePrice: 76.46387064903597,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "TRI",
                    averagePrice: 67.5280021787942,
                    status: OrderStatus.filled
                },
                symbol: "TRI",
                price: 67.49,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583419020000
            }
        ]
    },
    {
        symbol: "BAM",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 62,
        plannedStopPrice: 64,
        plannedQuantity: 5,
        plannedRiskUnits: 28,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "BAM",
            averagePrice: 91.92258538660484,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAM",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 92,
                t: 1583418960000,
                order: {
                    filledQuantity: 5,
                    symbol: "BAM",
                    averagePrice: 91.92258538660484,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BAM",
                    averagePrice: 93.35394965786527,
                    status: OrderStatus.filled
                },
                symbol: "BAM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1583419020000
            }
        ]
    },
    {
        symbol: "CP",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 247.5,
        plannedStopPrice: 255,
        plannedQuantity: 1,
        plannedRiskUnits: 12.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CP",
            averagePrice: 242.46520181175435,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CP",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 242.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 1,
                    symbol: "CP",
                    averagePrice: 242.46520181175435,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CP",
                    averagePrice: 234.01381430881654,
                    status: OrderStatus.filled
                },
                symbol: "CP",
                price: 233.94,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583505420000
            }
        ]
    },
    {
        symbol: "CP",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 241.5,
        plannedStopPrice: 248,
        plannedQuantity: 1,
        plannedRiskUnits: 20.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "CP",
            averagePrice: 227.4828510964156,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CP",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 227.5,
                t: 1583760960000,
                order: {
                    filledQuantity: 1,
                    symbol: "CP",
                    averagePrice: 227.4828510964156,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CP",
                    averagePrice: 221.03501045104167,
                    status: OrderStatus.filled
                },
                symbol: "CP",
                price: 220.985,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583763840000
            }
        ]
    },
    {
        symbol: "CNI",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 95,
        plannedStopPrice: 93.93900382850445,
        plannedQuantity: 9,
        plannedRiskUnits: 0.560996171495546,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CNI",
            averagePrice: 94.58391984402452,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CNI",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 94.5,
                t: 1573223760000,
                order: {
                    filledQuantity: 9,
                    symbol: "CNI",
                    averagePrice: 94.58391984402452,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "CNI",
                    averagePrice: 94.02107585837672,
                    status: OrderStatus.filled
                },
                symbol: "CNI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1573501980000
            }
        ]
    },
    {
        symbol: "EXR",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 107.5,
        plannedStopPrice: 111,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "EXR",
            averagePrice: 107.9946973067131,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXR",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 108,
                t: 1573223760000,
                order: {
                    filledQuantity: 2,
                    symbol: "EXR",
                    averagePrice: 107.9946973067131,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "EXR",
                    averagePrice: 104.85020455241076,
                    status: OrderStatus.filled
                },
                symbol: "EXR",
                price: 104.76,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573591920000
            }
        ]
    },
    {
        symbol: "INTC",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 58.5,
        plannedStopPrice: 57.96939079575462,
        plannedQuantity: 18,
        plannedRiskUnits: 0.5306092042453798,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "INTC",
            averagePrice: 58.55174075351633,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INTC",
                quantity: 18,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 58.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 18,
                    symbol: "INTC",
                    averagePrice: 58.55174075351633,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 18,
                    symbol: "INTC",
                    averagePrice: 57.72031942449647,
                    status: OrderStatus.filled
                },
                symbol: "INTC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 18,
                t: 1573655460000
            }
        ]
    },
    {
        symbol: "DTE",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 120.5,
        plannedStopPrice: 122,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "DTE",
            averagePrice: 120.46980606689169,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DTE",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 120.5,
                t: 1573569360000,
                order: {
                    filledQuantity: 6,
                    symbol: "DTE",
                    averagePrice: 120.46980606689169,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "DTE",
                    averagePrice: 122.1135828377961,
                    status: OrderStatus.filled
                },
                symbol: "DTE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1573659180000
            }
        ]
    },
    {
        symbol: "VTR",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 59,
        plannedStopPrice: 60.048600651864405,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0486006518644047,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "VTR",
            averagePrice: 58.924632225415046,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VTR",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 59,
                t: 1573569360000,
                order: {
                    filledQuantity: 9,
                    symbol: "VTR",
                    averagePrice: 58.924632225415046,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "VTR",
                    averagePrice: 58.64219711499381,
                    status: OrderStatus.filled
                },
                symbol: "VTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1574189880000
            }
        ]
    },
    {
        symbol: "CNI",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 93.5,
        plannedStopPrice: 92,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "CNI",
            averagePrice: 93.09792664142599,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CNI",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 93,
                t: 1574087760000,
                order: {
                    filledQuantity: 6,
                    symbol: "CNI",
                    averagePrice: 93.09792664142599,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "CNI",
                    averagePrice: 91.7976285572183,
                    status: OrderStatus.filled
                },
                symbol: "CNI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574260260000
            }
        ]
    },
    {
        symbol: "DTE",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 123,
        plannedStopPrice: 126,
        plannedQuantity: 3,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "DTE",
            averagePrice: 123.90864153051513,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DTE",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 124,
                t: 1574087760000,
                order: {
                    filledQuantity: 3,
                    symbol: "DTE",
                    averagePrice: 123.90864153051513,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "DTE",
                    averagePrice: 123.89126502701966,
                    status: OrderStatus.filled
                },
                symbol: "DTE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 3,
                t: 1574263020000
            }
        ]
    },
    {
        symbol: "LBRDA",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 117.5,
        plannedStopPrice: 116,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "LBRDA",
            averagePrice: 117.06948145295941,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LBRDA",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 117,
                t: 1574174160000,
                order: {
                    filledQuantity: 6,
                    symbol: "LBRDA",
                    averagePrice: 117.06948145295941,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LBRDA",
                    averagePrice: 118.70268327524765,
                    status: OrderStatus.filled
                },
                symbol: "LBRDA",
                price: 118.74,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1574260860000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "LBRDA",
                    averagePrice: 120.13885600020096,
                    status: OrderStatus.filled
                },
                symbol: "LBRDA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574281740000
            }
        ]
    },
    {
        symbol: "FMC",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 98,
        plannedStopPrice: 96,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "FMC",
            averagePrice: 97.09678699283312,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FMC",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 97,
                t: 1574087760000,
                order: {
                    filledQuantity: 5,
                    symbol: "FMC",
                    averagePrice: 97.09678699283312,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "FMC",
                    averagePrice: 97.16929715058123,
                    status: OrderStatus.filled
                },
                symbol: "FMC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574282340000
            }
        ]
    },
    {
        symbol: "EXR",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 106.5,
        plannedStopPrice: 108,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "EXR",
            averagePrice: 106.49808309942536,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXR",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 106.5,
                t: 1574087760000,
                order: {
                    filledQuantity: 6,
                    symbol: "EXR",
                    averagePrice: 106.49808309942536,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "EXR",
                    averagePrice: 105.75077967196356,
                    status: OrderStatus.filled
                },
                symbol: "EXR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574348100000
            }
        ]
    },
    {
        symbol: "VTR",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 58.5,
        plannedStopPrice: 59.049336789995415,
        plannedQuantity: 18,
        plannedRiskUnits: 0.04933678999541513,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "VTR",
            averagePrice: 58.981283578020566,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VTR",
                quantity: 18,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 59,
                t: 1575038160000,
                order: {
                    filledQuantity: 18,
                    symbol: "VTR",
                    averagePrice: 58.981283578020566,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 18,
                    symbol: "VTR",
                    averagePrice: 59.07641703536818,
                    status: OrderStatus.filled
                },
                symbol: "VTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 18,
                t: 1575038340000
            }
        ]
    },
    {
        symbol: "CNA",
        originalQuantity: 20,
        hasHardStop: false,
        plannedEntryPrice: 44.5,
        plannedStopPrice: 45,
        plannedQuantity: 20,
        plannedRiskUnits: 0.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 20,
            symbol: "CNA",
            averagePrice: 44.46183811703264,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CNA",
                quantity: 20,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 44.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 20,
                    symbol: "CNA",
                    averagePrice: 44.46183811703264,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "CNA",
                    averagePrice: 44.03475439644743,
                    status: OrderStatus.filled
                },
                symbol: "CNA",
                price: 44.01,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1574260260000
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "CNA",
                    averagePrice: 44.8139208071596,
                    status: OrderStatus.filled
                },
                symbol: "CNA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575059460000
            }
        ]
    },
    {
        symbol: "LBRDA",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 119,
        plannedStopPrice: 117,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "LBRDA",
            averagePrice: 118.0042466668933,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LBRDA",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 118,
                t: 1575297360000,
                order: {
                    filledQuantity: 5,
                    symbol: "LBRDA",
                    averagePrice: 118.0042466668933,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "LBRDA",
                    averagePrice: 116.86011025653129,
                    status: OrderStatus.filled
                },
                symbol: "LBRDA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575384420000
            }
        ]
    },
    {
        symbol: "INTC",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 58,
        plannedStopPrice: 56,
        plannedQuantity: 5,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "INTC",
            averagePrice: 58.503520141186996,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "INTC",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 58.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 5,
                    symbol: "INTC",
                    averagePrice: 58.503520141186996,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "INTC",
                    averagePrice: 55.817065949287525,
                    status: OrderStatus.filled
                },
                symbol: "INTC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575390360000
            }
        ]
    },
    {
        symbol: "VTR",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 57.5,
        plannedStopPrice: 58.02710286502707,
        plannedQuantity: 18,
        plannedRiskUnits: 0.5271028650270679,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "VTR",
            averagePrice: 57.494373041404465,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "VTR",
                quantity: 18,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 57.5,
                t: 1575642960000,
                order: {
                    filledQuantity: 18,
                    symbol: "VTR",
                    averagePrice: 57.494373041404465,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 18,
                    symbol: "VTR",
                    averagePrice: 57.82086013804015,
                    status: OrderStatus.filled
                },
                symbol: "VTR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 18,
                t: 1575646560000
            }
        ]
    },
    {
        symbol: "FMC",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 98,
        plannedStopPrice: 96,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "FMC",
            averagePrice: 97.54673602936059,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FMC",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 97.5,
                t: 1574346960000,
                order: {
                    filledQuantity: 5,
                    symbol: "FMC",
                    averagePrice: 97.54673602936059,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "FMC",
                    averagePrice: 99.29524455380289,
                    status: OrderStatus.filled
                },
                symbol: "FMC",
                price: 99.385,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1575916740000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "FMC",
                    averagePrice: 98.39367075077101,
                    status: OrderStatus.filled
                },
                symbol: "FMC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1576079220000
            }
        ]
    },
    {
        symbol: "EXR",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 105.5,
        plannedStopPrice: 108,
        plannedQuantity: 4,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "EXR",
            averagePrice: 106.422172952556,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXR",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 106.5,
                t: 1575038160000,
                order: {
                    filledQuantity: 4,
                    symbol: "EXR",
                    averagePrice: 106.422172952556,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "EXR",
                    averagePrice: 105.0422429309731,
                    status: OrderStatus.filled
                },
                symbol: "EXR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1576085520000
            }
        ]
    },
    {
        symbol: "EXR",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 103,
        plannedStopPrice: 105,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "EXR",
            averagePrice: 103.95212001196214,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXR",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 104,
                t: 1576852560000,
                order: {
                    filledQuantity: 5,
                    symbol: "EXR",
                    averagePrice: 103.95212001196214,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "EXR",
                    averagePrice: 105.1246642070571,
                    status: OrderStatus.filled
                },
                symbol: "EXR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1576873140000
            }
        ]
    },
    {
        symbol: "EXR",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 103.5,
        plannedStopPrice: 105,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "EXR",
            averagePrice: 103.94811948170339,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "EXR",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 104,
                t: 1577370960000,
                order: {
                    filledQuantity: 6,
                    symbol: "EXR",
                    averagePrice: 103.94811948170339,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "EXR",
                    averagePrice: 105.15642151140872,
                    status: OrderStatus.filled
                },
                symbol: "EXR",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1577457060000
            }
        ]
    },
    {
        symbol: "OXY",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 42,
        plannedStopPrice: 43,
        plannedQuantity: 10,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "OXY",
            averagePrice: 41.9955665033821,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "OXY",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 42,
                t: 1579876560000,
                order: {
                    filledQuantity: 10,
                    symbol: "OXY",
                    averagePrice: 41.9955665033821,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 10,
                    symbol: "OXY",
                    averagePrice: 42.39715468115317,
                    status: OrderStatus.filled
                },
                symbol: "OXY",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 10,
                t: 1579876620000
            }
        ]
    },
    {
        symbol: "BIDU",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 126,
        plannedStopPrice: 130,
        plannedQuantity: 2,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "BIDU",
            averagePrice: 126.9039503356019,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIDU",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 127,
                t: 1580308560000,
                order: {
                    filledQuantity: 2,
                    symbol: "BIDU",
                    averagePrice: 126.9039503356019,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BIDU",
                    averagePrice: 109.31548725395285,
                    status: OrderStatus.filled
                },
                symbol: "BIDU",
                price: 109.23,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580308620000
            }
        ]
    },
    {
        symbol: "IDXX",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 280,
        plannedStopPrice: 275,
        plannedQuantity: 2,
        plannedRiskUnits: 6,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "IDXX",
            averagePrice: 281.03862288060765,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "IDXX",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 281,
                t: 1580308560000,
                order: {
                    filledQuantity: 2,
                    symbol: "IDXX",
                    averagePrice: 281.03862288060765,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "IDXX",
                    averagePrice: 285.5161859387654,
                    status: OrderStatus.filled
                },
                symbol: "IDXX",
                price: 285.6,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580482200000
            }
        ]
    },
    {
        symbol: "BIDU",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 126,
        plannedStopPrice: 130,
        plannedQuantity: 2,
        plannedRiskUnits: 7,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "BIDU",
            averagePrice: 122.99102172691475,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BIDU",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 123,
                t: 1580394960000,
                order: {
                    filledQuantity: 2,
                    symbol: "BIDU",
                    averagePrice: 122.99102172691475,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "BIDU",
                    averagePrice: 130.1738898531479,
                    status: OrderStatus.filled
                },
                symbol: "BIDU",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1580740440000
            }
        ]
    },
    {
        symbol: "CHL",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 41,
        plannedStopPrice: 42.01627781515279,
        plannedQuantity: 9,
        plannedRiskUnits: 0.5162778151527903,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "CHL",
            averagePrice: 41.45477078694111,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CHL",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 41.5,
                t: 1580826960000,
                order: {
                    filledQuantity: 9,
                    symbol: "CHL",
                    averagePrice: 41.45477078694111,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "CHL",
                    averagePrice: 43.26756781871646,
                    status: OrderStatus.filled
                },
                symbol: "CHL",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1580999460000
            }
        ]
    },
    {
        symbol: "NKE",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 101.5,
        plannedStopPrice: 104,
        plannedQuantity: 4,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "NKE",
            averagePrice: 99.93322807237293,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NKE",
                quantity: 4,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 100,
                t: 1580913360000,
                order: {
                    filledQuantity: 4,
                    symbol: "NKE",
                    averagePrice: 99.93322807237293,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "NKE",
                    averagePrice: 90.12664561258737,
                    status: OrderStatus.filled
                },
                symbol: "NKE",
                price: 90.065,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1580913420000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "NKE",
                    averagePrice: 101.93474096134713,
                    status: OrderStatus.filled
                },
                symbol: "NKE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582227900000
            }
        ]
    },
    {
        symbol: "LBRDA",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 124,
        plannedStopPrice: 128,
        plannedQuantity: 2,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "LBRDA",
            averagePrice: 125.91082938842405,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "LBRDA",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 126,
                t: 1583246160000,
                order: {
                    filledQuantity: 2,
                    symbol: "LBRDA",
                    averagePrice: 125.91082938842405,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "LBRDA",
                    averagePrice: 118.87554172362505,
                    status: OrderStatus.filled
                },
                symbol: "LBRDA",
                price: 118.86,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583246220000
            }
        ]
    },
    {
        symbol: "PBA",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 36,
        plannedStopPrice: 37,
        plannedQuantity: 10,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "PBA",
            averagePrice: 35.43077036034614,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PBA",
                quantity: 10,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 35.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 10,
                    symbol: "PBA",
                    averagePrice: 35.43077036034614,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "PBA",
                    averagePrice: 34.53496133116532,
                    status: OrderStatus.filled
                },
                symbol: "PBA",
                price: 34.5,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1583505180000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "PBA",
                    averagePrice: 33.203632064326456,
                    status: OrderStatus.filled
                },
                symbol: "PBA",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1583528400000
            }
        ]
    },
    {
        symbol: "ENB",
        originalQuantity: 18,
        hasHardStop: false,
        plannedEntryPrice: 38.5,
        plannedStopPrice: 39.032446129377824,
        plannedQuantity: 18,
        plannedRiskUnits: 1.0324461293778242,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 18,
            symbol: "ENB",
            averagePrice: 37.90210543545056,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "ENB",
                quantity: 18,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 38,
                t: 1583418960000,
                order: {
                    filledQuantity: 18,
                    symbol: "ENB",
                    averagePrice: 37.90210543545056,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 14,
                    symbol: "ENB",
                    averagePrice: 36.846472811555834,
                    status: OrderStatus.filled
                },
                symbol: "ENB",
                price: 36.82,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 14,
                t: 1583419020000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "ENB",
                    averagePrice: 36.769182420904805,
                    status: OrderStatus.filled
                },
                symbol: "ENB",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1583528400000
            }
        ]
    },
    {
        symbol: "NKE",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 90,
        plannedStopPrice: 93,
        plannedQuantity: 3,
        plannedRiskUnits: 5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "NKE",
            averagePrice: 87.9143623546745,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NKE",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 88,
                t: 1583505360000,
                order: {
                    filledQuantity: 3,
                    symbol: "NKE",
                    averagePrice: 87.9143623546745,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "NKE",
                    averagePrice: 82.0728109685294,
                    status: OrderStatus.filled
                },
                symbol: "NKE",
                price: 81.98,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1583760660000
            }
        ]
    },
    {
        symbol: "MNST",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 64.5,
        plannedStopPrice: 68,
        plannedQuantity: 2,
        plannedRiskUnits: 6.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "MNST",
            averagePrice: 61.41304462620427,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MNST",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 61.5,
                t: 1583760960000,
                order: {
                    filledQuantity: 2,
                    symbol: "MNST",
                    averagePrice: 61.41304462620427,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MNST",
                    averagePrice: 56.41712183493091,
                    status: OrderStatus.filled
                },
                symbol: "MNST",
                price: 56.33,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1583761020000
            }
        ]
    },
    {
        symbol: "DRI",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 112,
        plannedStopPrice: 114,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "DRI",
            averagePrice: 112.45391907694028,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "DRI",
                quantity: 5,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 112.5,
                t: 1572615360000,
                order: {
                    filledQuantity: 5,
                    symbol: "DRI",
                    averagePrice: 112.45391907694028,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "DRI",
                    averagePrice: 114.11409893245653,
                    status: OrderStatus.filled
                },
                symbol: "DRI",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1573227120000
            }
        ]
    },
    {
        symbol: "AAPL",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 258,
        plannedStopPrice: 253,
        plannedQuantity: 2,
        plannedRiskUnits: 4.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "AAPL",
            averagePrice: 257.53382410529423,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "AAPL",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 257.5,
                t: 1572964560000,
                order: {
                    filledQuantity: 2,
                    symbol: "AAPL",
                    averagePrice: 257.53382410529423,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "AAPL",
                    averagePrice: 262.0280940561709,
                    status: OrderStatus.filled
                },
                symbol: "AAPL",
                price: 262.0384,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573496640000
            }
        ]
    },
    {
        symbol: "CDW",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 134,
        plannedStopPrice: 131,
        plannedQuantity: 3,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "CDW",
            averagePrice: 133.02248815147672,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDW",
                quantity: 3,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 133,
                t: 1573223760000,
                order: {
                    filledQuantity: 3,
                    symbol: "CDW",
                    averagePrice: 133.02248815147672,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "CDW",
                    averagePrice: 135.72021488958575,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 135.74,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1573832400000
            }
        ]
    },
    {
        symbol: "QCOM",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 90.5,
        plannedStopPrice: 88,
        plannedQuantity: 4,
        plannedRiskUnits: 5.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "QCOM",
            averagePrice: 93.5722833218503,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "QCOM",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 93.5,
                t: 1573828560000,
                order: {
                    filledQuantity: 4,
                    symbol: "QCOM",
                    averagePrice: 93.5722833218503,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "QCOM",
                    averagePrice: 91.92206846749717,
                    status: OrderStatus.filled
                },
                symbol: "QCOM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1573836780000
            }
        ]
    },
    {
        symbol: "MCD",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 193,
        plannedStopPrice: 197,
        plannedQuantity: 2,
        plannedRiskUnits: 4,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "MCD",
            averagePrice: 192.98789002992208,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MCD",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 193,
                t: 1573482960000,
                order: {
                    filledQuantity: 2,
                    symbol: "MCD",
                    averagePrice: 192.98789002992208,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MCD",
                    averagePrice: 188.1673759177276,
                    status: OrderStatus.filled
                },
                symbol: "MCD",
                price: 188.1365,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1573848120000
            }
        ]
    },
    {
        symbol: "PSX",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 118.5,
        plannedStopPrice: 117,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "PSX",
            averagePrice: 118.00785621827133,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PSX",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 118,
                t: 1574174160000,
                order: {
                    filledQuantity: 6,
                    symbol: "PSX",
                    averagePrice: 118.00785621827133,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "PSX",
                    averagePrice: 116.83397886811217,
                    status: OrderStatus.filled
                },
                symbol: "PSX",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1574260260000
            }
        ]
    },
    {
        symbol: "CDW",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 139,
        plannedStopPrice: 137,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CDW",
            averagePrice: 138.0626551126201,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDW",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 138,
                t: 1574260560000,
                order: {
                    filledQuantity: 5,
                    symbol: "CDW",
                    averagePrice: 138.0626551126201,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "CDW",
                    averagePrice: 138.42065118478348,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1574264940000
            }
        ]
    },
    {
        symbol: "KSU",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 154.5,
        plannedStopPrice: 151,
        plannedQuantity: 2,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "KSU",
            averagePrice: 152.50953533231714,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KSU",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 152.5,
                t: 1573482960000,
                order: {
                    filledQuantity: 2,
                    symbol: "KSU",
                    averagePrice: 152.50953533231714,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "KSU",
                    averagePrice: 153.178822320214,
                    status: OrderStatus.filled
                },
                symbol: "KSU",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1574268960000
            }
        ]
    },
    {
        symbol: "NTRS",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 107,
        plannedStopPrice: 105,
        plannedQuantity: 5,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "NTRS",
            averagePrice: 105.5396611387833,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NTRS",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 105.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 5,
                    symbol: "NTRS",
                    averagePrice: 105.5396611387833,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "NTRS",
                    averagePrice: 107.38214410939817,
                    status: OrderStatus.filled
                },
                symbol: "NTRS",
                price: 107.42,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1574173860000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "NTRS",
                    averagePrice: 106.52603398821554,
                    status: OrderStatus.filled
                },
                symbol: "NTRS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1574282280000
            }
        ]
    },
    {
        symbol: "QCOM",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 86.5,
        plannedStopPrice: 83,
        plannedQuantity: 2,
        plannedRiskUnits: 2.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "QCOM",
            averagePrice: 85.53388954971507,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "QCOM",
                quantity: 2,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 85.5,
                t: 1574778960000,
                order: {
                    filledQuantity: 2,
                    symbol: "QCOM",
                    averagePrice: 85.53388954971507,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "QCOM",
                    averagePrice: 83.00470757337126,
                    status: OrderStatus.filled
                },
                symbol: "QCOM",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575304320000
            }
        ]
    },
    {
        symbol: "NTRS",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 108,
        plannedStopPrice: 106.93148337190108,
        plannedQuantity: 9,
        plannedRiskUnits: 1.0685166280989193,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "NTRS",
            averagePrice: 108.0389791395555,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "NTRS",
                quantity: 9,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 108,
                t: 1575297360000,
                order: {
                    filledQuantity: 9,
                    symbol: "NTRS",
                    averagePrice: 108.0389791395555,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "NTRS",
                    averagePrice: 106.92135357941001,
                    status: OrderStatus.filled
                },
                symbol: "NTRS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1575309540000
            }
        ]
    },
    {
        symbol: "KSU",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 154,
        plannedStopPrice: 152,
        plannedQuantity: 5,
        plannedRiskUnits: 1,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "KSU",
            averagePrice: 153.0959564216387,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KSU",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 153,
                t: 1575297360000,
                order: {
                    filledQuantity: 5,
                    symbol: "KSU",
                    averagePrice: 153.0959564216387,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "KSU",
                    averagePrice: 152.046826778646,
                    status: OrderStatus.filled
                },
                symbol: "KSU",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575319260000
            }
        ]
    },
    {
        symbol: "MS",
        originalQuantity: 10,
        hasHardStop: false,
        plannedEntryPrice: 49,
        plannedStopPrice: 48,
        plannedQuantity: 10,
        plannedRiskUnits: 0.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 10,
            symbol: "MS",
            averagePrice: 48.533120170921556,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "MS",
                quantity: 10,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 48.5,
                t: 1573655760000,
                order: {
                    filledQuantity: 10,
                    symbol: "MS",
                    averagePrice: 48.533120170921556,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 8,
                    symbol: "MS",
                    averagePrice: 49.44176429199287,
                    status: OrderStatus.filled
                },
                symbol: "MS",
                price: 49.47,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 8,
                t: 1574174040000
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "MS",
                    averagePrice: 47.98001922397779,
                    status: OrderStatus.filled
                },
                symbol: "MS",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 2,
                t: 1575383700000
            }
        ]
    },
    {
        symbol: "PSX",
        originalQuantity: 3,
        hasHardStop: false,
        plannedEntryPrice: 114,
        plannedStopPrice: 117,
        plannedQuantity: 3,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 3,
            symbol: "PSX",
            averagePrice: 114.93009324318973,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "PSX",
                quantity: 3,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 115,
                t: 1575297360000,
                order: {
                    filledQuantity: 3,
                    symbol: "PSX",
                    averagePrice: 114.93009324318973,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 3,
                    symbol: "PSX",
                    averagePrice: 112.23511906811336,
                    status: OrderStatus.filled
                },
                symbol: "PSX",
                price: 112.19,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 3,
                t: 1575562860000
            }
        ]
    },
    {
        symbol: "KSU",
        originalQuantity: 4,
        hasHardStop: false,
        plannedEntryPrice: 150.5,
        plannedStopPrice: 148,
        plannedQuantity: 4,
        plannedRiskUnits: 4.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 4,
            symbol: "KSU",
            averagePrice: 152.52673551142593,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KSU",
                quantity: 4,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 152.5,
                t: 1575642960000,
                order: {
                    filledQuantity: 4,
                    symbol: "KSU",
                    averagePrice: 152.52673551142593,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "KSU",
                    averagePrice: 151.1155744532353,
                    status: OrderStatus.filled
                },
                symbol: "KSU",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1575988560000
            }
        ]
    },
    {
        symbol: "CDW",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 136,
        plannedStopPrice: 134,
        plannedQuantity: 5,
        plannedRiskUnits: 2,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CDW",
            averagePrice: 136.07887790740958,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDW",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 136,
                t: 1575642960000,
                order: {
                    filledQuantity: 5,
                    symbol: "CDW",
                    averagePrice: 136.07887790740958,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "CDW",
                    averagePrice: 135.10261785696807,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 5,
                t: 1575995700000
            }
        ]
    },
    {
        symbol: "CDW",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 143.5,
        plannedStopPrice: 142,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "CDW",
            averagePrice: 143.5150569448991,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDW",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 143.5,
                t: 1577370960000,
                order: {
                    filledQuantity: 6,
                    symbol: "CDW",
                    averagePrice: 143.5150569448991,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "CDW",
                    averagePrice: 142.6139532054151,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1577725680000
            }
        ]
    },
    {
        symbol: "CDW",
        originalQuantity: 5,
        hasHardStop: false,
        plannedEntryPrice: 142,
        plannedStopPrice: 140,
        plannedQuantity: 5,
        plannedRiskUnits: 1.5,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 5,
            symbol: "CDW",
            averagePrice: 141.55338457934357,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "CDW",
                quantity: 5,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 141.5,
                t: 1578494160000,
                order: {
                    filledQuantity: 5,
                    symbol: "CDW",
                    averagePrice: 141.55338457934357,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "CDW",
                    averagePrice: 143.357518295648,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 143.39,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 4,
                t: 1578669060000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "CDW",
                    averagePrice: 146.05329019692692,
                    status: OrderStatus.filled
                },
                symbol: "CDW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1579185060000
            }
        ]
    },
    {
        symbol: "FB",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 202.5,
        plannedStopPrice: 207,
        plannedQuantity: 2,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "FB",
            averagePrice: 204.98530180530912,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "FB",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 205,
                t: 1580826960000,
                order: {
                    filledQuantity: 2,
                    symbol: "FB",
                    averagePrice: 204.98530180530912,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "FB",
                    averagePrice: 195.11795961752117,
                    status: OrderStatus.filled
                },
                symbol: "FB",
                price: 195.08,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1580827020000
            }
        ]
    },
    {
        symbol: "GWW",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 311,
        plannedStopPrice: 319,
        plannedQuantity: 1,
        plannedRiskUnits: 3,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "GWW",
            averagePrice: 315.9137602094438,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GWW",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 316,
                t: 1580999760000,
                order: {
                    filledQuantity: 1,
                    symbol: "GWW",
                    averagePrice: 315.9137602094438,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "GWW",
                    averagePrice: 308.55358404844094,
                    status: OrderStatus.filled
                },
                symbol: "GWW",
                price: 308.53,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1581014280000
            }
        ]
    },
    {
        symbol: "COP",
        originalQuantity: 9,
        hasHardStop: false,
        plannedEntryPrice: 58,
        plannedStopPrice: 59.07015246081809,
        plannedQuantity: 9,
        plannedRiskUnits: 1.5701524608180932,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 9,
            symbol: "COP",
            averagePrice: 57.4395449193946,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "COP",
                quantity: 9,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 57.5,
                t: 1581086160000,
                order: {
                    filledQuantity: 9,
                    symbol: "COP",
                    averagePrice: 57.4395449193946,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 9,
                    symbol: "COP",
                    averagePrice: 60.361609611426125,
                    status: OrderStatus.filled
                },
                symbol: "COP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 9,
                t: 1581517860000
            }
        ]
    },
    {
        symbol: "WAT",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 223,
        plannedStopPrice: 227,
        plannedQuantity: 2,
        plannedRiskUnits: 3.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "WAT",
            averagePrice: 223.4145145562526,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WAT",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 223.5,
                t: 1581604560000,
                order: {
                    filledQuantity: 2,
                    symbol: "WAT",
                    averagePrice: 223.4145145562526,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "WAT",
                    averagePrice: 214.90156606857425,
                    status: OrderStatus.filled
                },
                symbol: "WAT",
                price: 214.86,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1581604620000
            }
        ]
    },
    {
        symbol: "GWW",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 304,
        plannedStopPrice: 310,
        plannedQuantity: 1,
        plannedRiskUnits: 5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "GWW",
            averagePrice: 304.94975787316207,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GWW",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 305,
                t: 1582036560000,
                order: {
                    filledQuantity: 1,
                    symbol: "GWW",
                    averagePrice: 304.94975787316207,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "GWW",
                    averagePrice: 310.50201678588417,
                    status: OrderStatus.filled
                },
                symbol: "GWW",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582122780000
            }
        ]
    },
    {
        symbol: "WAT",
        originalQuantity: 2,
        hasHardStop: false,
        plannedEntryPrice: 216,
        plannedStopPrice: 220,
        plannedQuantity: 2,
        plannedRiskUnits: 5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 2,
            symbol: "WAT",
            averagePrice: 214.97397886440746,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "WAT",
                quantity: 2,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 215,
                t: 1582209360000,
                order: {
                    filledQuantity: 2,
                    symbol: "WAT",
                    averagePrice: 214.97397886440746,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 2,
                    symbol: "WAT",
                    averagePrice: 209.8063419161156,
                    status: OrderStatus.filled
                },
                symbol: "WAT",
                price: 209.76,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 2,
                t: 1582554660000
            }
        ]
    },
    {
        symbol: "COP",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 58.5,
        plannedStopPrice: 60,
        plannedQuantity: 6,
        plannedRiskUnits: 1,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "COP",
            averagePrice: 58.941242229590536,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "COP",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 59,
                t: 1582209360000,
                order: {
                    filledQuantity: 6,
                    symbol: "COP",
                    averagePrice: 58.941242229590536,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "COP",
                    averagePrice: 56.31761911814878,
                    status: OrderStatus.filled
                },
                symbol: "COP",
                price: 56.26,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1582554660000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "COP",
                    averagePrice: 55.985612005722366,
                    status: OrderStatus.filled
                },
                symbol: "COP",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582641780000
            }
        ]
    },
    {
        symbol: "BAC",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 33.5,
        plannedStopPrice: 31.97571996456883,
        plannedQuantity: 6,
        plannedRiskUnits: 1.0242800354311683,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "BAC",
            averagePrice: 33.01851768469436,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAC",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 33,
                t: 1573482960000,
                order: {
                    filledQuantity: 6,
                    symbol: "BAC",
                    averagePrice: 33.01851768469436,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "BAC",
                    averagePrice: 34.39602241786386,
                    status: OrderStatus.filled
                },
                symbol: "BAC",
                price: 34.41,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1576163040000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "BAC",
                    averagePrice: 32.03703372679889,
                    status: OrderStatus.filled
                },
                symbol: "BAC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582645920000
            }
        ]
    },
    {
        symbol: "GE",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 11.5,
        plannedStopPrice: 9.989741335532415,
        plannedQuantity: 6,
        plannedRiskUnits: 1.5102586644675853,
        side: PositionDirection.long,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "GE",
            averagePrice: 11.507275415199713,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GE",
                quantity: 6,
                side: TradeDirection.buy,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 11.5,
                t: 1573223760000,
                order: {
                    filledQuantity: 6,
                    symbol: "GE",
                    averagePrice: 11.507275415199713,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 5,
                    symbol: "GE",
                    averagePrice: 12.830655639982126,
                    status: OrderStatus.filled
                },
                symbol: "GE",
                price: 12.885,
                type: TradeType.limit,
                side: TradeDirection.sell,
                tif: TimeInForce.day,
                quantity: 5,
                t: 1580311260000
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "GE",
                    averagePrice: 9.98252264222837,
                    status: OrderStatus.filled
                },
                symbol: "GE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.sell,
                tif: TimeInForce.gtc,
                quantity: 1,
                t: 1582900320000
            }
        ]
    },
    {
        symbol: "BAC",
        originalQuantity: 6,
        hasHardStop: false,
        plannedEntryPrice: 27.5,
        plannedStopPrice: 29,
        plannedQuantity: 6,
        plannedRiskUnits: 2,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 6,
            symbol: "BAC",
            averagePrice: 26.924578708385273,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "BAC",
                quantity: 6,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 27,
                t: 1583418960000,
                order: {
                    filledQuantity: 6,
                    symbol: "BAC",
                    averagePrice: 26.924578708385273,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 6,
                    symbol: "BAC",
                    averagePrice: 27.126898515245653,
                    status: OrderStatus.filled
                },
                symbol: "BAC",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 6,
                t: 1583421180000
            }
        ]
    },
    {
        symbol: "GE",
        originalQuantity: 19,
        hasHardStop: false,
        plannedEntryPrice: 10.5,
        plannedStopPrice: 11.018918350238575,
        plannedQuantity: 19,
        plannedRiskUnits: 0.5189183502385752,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 19,
            symbol: "GE",
            averagePrice: 10.481119483133547,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "GE",
                quantity: 19,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 10.5,
                t: 1583418960000,
                order: {
                    filledQuantity: 19,
                    symbol: "GE",
                    averagePrice: 10.481119483133547,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 15,
                    symbol: "GE",
                    averagePrice: 10.055579230984419,
                    status: OrderStatus.filled
                },
                symbol: "GE",
                price: 10.0021,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 15,
                t: 1583436240000
            },
            {
                order: {
                    filledQuantity: 4,
                    symbol: "GE",
                    averagePrice: 9.283618532080006,
                    status: OrderStatus.filled
                },
                symbol: "GE",
                price: 0,
                type: TradeType.market,
                side: TradeDirection.buy,
                tif: TimeInForce.gtc,
                quantity: 4,
                t: 1583505060000
            }
        ]
    },
    {
        symbol: "KSU",
        originalQuantity: 1,
        hasHardStop: false,
        plannedEntryPrice: 153,
        plannedStopPrice: 159,
        plannedQuantity: 1,
        plannedRiskUnits: 12.5,
        side: PositionDirection.short,
        quantity: 0,
        order: {
            filledQuantity: 1,
            symbol: "KSU",
            averagePrice: 146.4973099092924,
            status: OrderStatus.filled
        },
        trades: [
            {
                symbol: "KSU",
                quantity: 1,
                side: TradeDirection.sell,
                type: TradeType.stop,
                tif: TimeInForce.day,
                price: 146.5,
                t: 1583505360000,
                order: {
                    filledQuantity: 1,
                    symbol: "KSU",
                    averagePrice: 146.4973099092924,
                    status: OrderStatus.filled
                }
            },
            {
                order: {
                    filledQuantity: 1,
                    symbol: "KSU",
                    averagePrice: 130.357584653728,
                    status: OrderStatus.filled
                },
                symbol: "KSU",
                price: 130.26,
                type: TradeType.limit,
                side: TradeDirection.buy,
                tif: TimeInForce.day,
                quantity: 1,
                t: 1583760720000
            }
        ]
    }
];
