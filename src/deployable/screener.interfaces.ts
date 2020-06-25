import { AlpacaOrder } from "@neeschit/alpaca-trade-api";
import { messageService, Service } from "../util/api";
import { LOGGER } from "../instrumentation/log";
import { TickBar, Bar } from "../data/data.model";

export const refreshPlanPath = "/refresh_plan/:symbol";

export const postRequestToRefreshPlan = async (symbol: string, order: AlpacaOrder) => {
    try {
        return messageService(Service.screener, `/refresh_plan/${symbol}`, order);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

export const manageOpenOrderPath = "/manage_open_order/:symbol";

export const postRequestToManageOpenOrders = async (symbol: string, bar: TickBar) => {
    try {
        return messageService(Service.screener, `/manage_open_order/${symbol}`, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return {
        success: true,
    };
};

export const screenSymbolPath = "/screen/:symbol";

export const postRequestScreenSymbol = async (symbol: string, bar: Bar, epoch = Date.now()) => {
    try {
        return messageService(Service.screener, `/screen/${symbol}`, {
            epoch,
            bar,
        });
    } catch (e) {
        LOGGER.error(e);

        return null;
    }
};
