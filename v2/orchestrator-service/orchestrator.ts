import { Calendar } from "@neeschit/alpaca-trade-api";
import { endOfDay, startOfDay } from "date-fns";
import { getCalendar, PolygonTradeUpdate } from "../brokerage-helpers";
import { rebalance } from "../trade-management-api";
import { insertBarData } from "../trade-management-helpers/stream";

export class CachedCalendar {
    public static value: Calendar[];
    public static async getCalendar(epoch = Date.now()) {
        if (!CachedCalendar.value || !CachedCalendar.value.length) {
            CachedCalendar.value = await getCalendar(
                startOfDay(new Date(epoch)),
                endOfDay(new Date(epoch))
            );
        }

        return CachedCalendar.value;
    }
}

export const onStockMinuteDataPosted = async (
    subject: string,
    dataJson: string,
    epoch?: number
) => {
    const data = JSON.parse(dataJson) as PolygonTradeUpdate[];

    const uniqueSymbols = await insertBarData(data);

    const calendar = await CachedCalendar.getCalendar();

    for (const sym of uniqueSymbols) {
        try {
            await rebalance(sym, calendar, epoch);
        } catch (e) {
            console.error("couldnt enter symbol " + sym, e);
        }
    }
};
