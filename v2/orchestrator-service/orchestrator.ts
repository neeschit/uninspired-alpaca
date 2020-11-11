import { TickBar } from "../../src/data/data.model";
import { insertBar } from "../../src/resources/stockData";
import { PolygonTradeUpdate } from "../brokerage-helpers";
import { enterSymbolForTrade } from "../trade-management-api";

export const onStockMinuteDataPosted = async (
    subject: string,
    dataJson: string,
    epoch?: number
) => {
    const data = JSON.parse(dataJson) as PolygonTradeUpdate[];

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

    for (const sym of uniqueSymbols) {
        try {
            await enterSymbolForTrade(sym, epoch);
        } catch (e) {
            console.error("couldnt enter symbol " + sym, e);
        }
    }
};
