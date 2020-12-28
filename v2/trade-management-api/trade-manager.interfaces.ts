import { Calendar } from "@neeschit/alpaca-trade-api";
import { messageService, Service } from "../../src/util/api";

export const rebalance = async (
    symbol: string,
    calendar: Calendar[],
    epoch = Date.now()
): Promise<string[]> => {
    return (await messageService(Service.manager, "/rebalance/" + symbol, {
        epoch,
        calendar,
    })) as any;
};
