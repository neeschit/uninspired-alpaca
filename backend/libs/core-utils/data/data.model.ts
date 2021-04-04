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
