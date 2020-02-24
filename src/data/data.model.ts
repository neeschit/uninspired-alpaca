import {
    PositionDirection,
    TradeDirection,
    TradeType,
    TimeInForce,
    OrderStatus
} from "@alpacahq/alpaca-trade-api";

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

export enum PeriodType {
    day = "day",
    hour = "hour",
    minute = "minute"
}

export enum DefaultDuration {
    fifteen = "15",
    five = "5",
    one = "1"
}

export interface SymbolContainingConfig {
    symbol: string;
    quantity: number;
}

export interface TradePlan extends SymbolContainingConfig {
    plannedStopPrice: number;
    plannedEntryPrice: number;
    plannedQuantity: number;
    side: PositionDirection;
}

export interface TradeConfig extends SymbolContainingConfig {
    side: TradeDirection;
    type: TradeType;
    tif: TimeInForce;
    price: number;
    stopPrice?: number;
}

export interface PositionConfig extends TradePlan {
    plannedRiskUnits: number;
    hasHardStop: boolean;
    originalQuantity: number;
}

export interface FilledPositionConfig extends PositionConfig {
    order: Order;
}

export interface Order {
    symbol: string;
    filledQuantity: number;
    averagePrice: number;
    status: OrderStatus;
}
