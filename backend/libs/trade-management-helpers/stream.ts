import { Bar } from "@master-chief/alpaca";
import { TickBar } from "../core-utils/data/data.model";
import { PolygonTradeUpdate } from "../core-utils/resources/polygon";
import { insertBar } from "../core-utils/resources/stockData";

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

export async function insertBarDataV2(bar: Bar, symbol: string, epoch: number) {
    try {
        const tick: TickBar = {
            o: bar.o,
            vw: 0,
            h: bar.h,
            l: bar.l,
            v: bar.v,
            c: bar.c,
            t: epoch,
        };

        await insertBar(tick, symbol, true);
    } catch (e) {
        console.error("couldnt insert bar", e);
    }
}
