export * from "./alpaca";

export interface PolygonTradeUpdate {
    ev: string;
    sym: string;
    v: number;
    av: number;
    op: number;
    vw: number;
    o: number;
    c: number;
    l: number;
    h: number;
    a: number;
    s: number;
    e: number;
}
