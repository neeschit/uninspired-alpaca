import { TickBar } from "../../src/data/data.model";
import { insertBar } from "../../src/resources/stockData";
import { PolygonTradeUpdate } from "../brokerage-helpers";

export async function insertBarData(data: PolygonTradeUpdate[]) {
    const uniqueSymbols = [];

    for (const d of data) {
        try {
            const bar: TickBar = {
                o: d.o,
                vw: d.a,
                h: d.h,
                l: d.l,
                v: d.v,
                c: d.c,
                t: d.s,
            };

            await insertBar(bar, d.sym, true);

            if (uniqueSymbols.indexOf(d.sym) === -1) uniqueSymbols.push(d.sym);
        } catch (e) {
            console.error("couldnt insert bar", e);
        }
    }
    return uniqueSymbols;
}
