import { Calendar } from "@neeschit/alpaca-trade-api";
import { addBusinessDays, endOfDay, parseISO, startOfDay } from "date-fns";
import { PolygonTradeUpdate } from "../../libs/core-utils/resources/polygon";
import { getCalendar } from "../../libs/brokerage-helpers/alpaca";
import { rebalance } from "../trade-management-api/trade-manager.interfaces";
import {
    insertBarData,
    insertBarDataV2,
} from "../../libs/trade-management-helpers/stream";

export class CachedCalendar {
    public static value: Calendar[];
    public static async getCalendar(epoch = Date.now()) {
        if (!CachedCalendar.value || !CachedCalendar.value.length) {
            CachedCalendar.value = await getCalendar(
                startOfDay(addBusinessDays(epoch, -10)),
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

export const onStockMinuteDataPostedV2 = async (bar: any) => {
    const symbol = bar.S;
    const epoch = parseISO(bar.t).getTime();
    await insertBarDataV2(bar, symbol, epoch);

    const calendar = await CachedCalendar.getCalendar();

    try {
        await rebalance(symbol, calendar, epoch);
    } catch (e) {
        /* console.error("couldnt enter symbol " + sym, e); */
    }
};
