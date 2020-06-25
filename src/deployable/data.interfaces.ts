import { Bar, TickBar } from "../data/data.model";
import { getFromService, Service, messageService } from "../util/api";
import { LOGGER } from "../instrumentation/log";

export const getBarsFromDataServicePath = "/bars/:symbol";

export const getBarsFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar[]> => {
    try {
        const bars: Bar[] = (await getFromService(Service.data, "/bars/" + symbol, {
            epoch: currentEpoch,
        })) as any;

        return bars;
    } catch (e) {
        LOGGER.error(e);
    }

    return [];
};

export const barFromDataServicePath = "/bar/:symbol";

export const postAggregatedMinuteUpdate = async (
    symbol: string,
    bar: TickBar
): Promise<unknown> => {
    try {
        return messageService(Service.data, `/bar/${symbol}`, bar);
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};

export const minuteBarPath = "/minute_bar/:symbol";

export const getLastMinuteBarFromDataService = async (
    symbol: string,
    currentEpoch = Date.now()
): Promise<Bar | null> => {
    try {
        const bar: Bar = (await getFromService(Service.data, "/minute_bar/" + symbol, {
            epoch: currentEpoch,
        })) as any;

        return bar;
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};
