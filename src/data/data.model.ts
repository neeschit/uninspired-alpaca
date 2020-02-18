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
    long = "buy",
    short = "sell"
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

export interface TradeConfig {
    symbol: string;
    quantity: number;
    side: TradeDirection;
    type: TradeType;
    tif: TimeInForce;
    price: number;
}
