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

export enum TradeDirection {
    buy = "buy",
    sell = "sell"
}

export enum PositionDirection {
    long = "long",
    short = "short"
}

export enum TradeType {
    market = "market",
    limit = "limit",
    stop = "stop",
    stop_limit = "stop_limit"
}

export enum TimeInForce {
    day = "day",
    gtc = "gtc",
    opg = "opg",
    cls = "cls",
    ioc = "ioc",
    fok = "fok"
}

export interface SymbolContainingConfig {
    symbol: string;
    quantity: number;
}

export interface TradePlan extends SymbolContainingConfig {
    plannedStopPrice: number;
    plannedEntryPrice: number;
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
    averageEntryPrice: number;
    plannedRiskUnits: number;
    hasHardStop: boolean;
    originalQuantity: number;
}
