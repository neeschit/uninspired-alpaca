import {
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce,
    OrderStatus,
} from "@neeschit/alpaca-trade-api";

export const MarketTimezone = "America/New_York";

export type TimestampType = number | Date;

export interface Bar {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    t: number;
    n?: number;
}

export interface PolygonBar {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    t: number;
    vw: number;
    n?: number;
}

export interface TickBar extends Omit<Bar, "n"> {
    a?: number;
    vw: number;
    av?: number;
    op?: number;
}

export enum PeriodType {
    day = "day",
    hour = "hour",
    minute = "minute",
}

export enum DefaultDuration {
    fifteen = "15",
    five = "5",
    one = "1",
}

export interface SymbolContainingConfig {
    symbol: string;
}

export interface TradePlan extends SymbolContainingConfig {
    plannedStopPrice: number;
    plannedEntryPrice: number;
    riskAtrRatio: number;
    quantity: number;
    side: PositionDirection;
}

export interface TradeConfig extends SymbolContainingConfig {
    side: TradeDirection;
    type: TradeType;
    tif: TimeInForce;
    price: number;
    t: number;
    estString?: string;
    stopPrice?: number;
    quantity: number;
}

export interface PlannedTradeConfig {
    plan: TradePlan;
    config: TradeConfig;
}

export interface FilledTradeConfig extends TradeConfig {
    filledQuantity: number;
    averagePrice: number;
    status: OrderStatus;
}

export interface TradeUpdate {
    sym: string;
    i: number;
    x: number;
    p: number;
    s: number;
    t: number;
    z: number;
    c: number[];
}
