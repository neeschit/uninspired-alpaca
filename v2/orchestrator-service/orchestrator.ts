import { PolygonTradeUpdate } from "../brokerage-helpers";
import { enterSymbolForTrade } from "../trade-management-api";
import { insertBarData } from "../trade-management-helpers/stream";

export const onStockMinuteDataPosted = async (
    subject: string,
    dataJson: string,
    epoch?: number
) => {
    const data = JSON.parse(dataJson) as PolygonTradeUpdate[];

    const uniqueSymbols = await insertBarData(data);

    for (const sym of uniqueSymbols) {
        try {
            await enterSymbolForTrade(sym, epoch);
        } catch (e) {
            console.error("couldnt enter symbol " + sym, e);
        }
    }
};
