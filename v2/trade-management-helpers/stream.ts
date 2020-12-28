import { TickBar } from "../../libs/core-utils/data/data.model";
import { PolygonTradeUpdate } from "../../libs/core-utils/resources/polygon";
import { insertBar } from "../../libs/core-utils/resources/stockData";

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
