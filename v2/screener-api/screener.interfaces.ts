import { getFromService, Service } from "../../src/util/api";

export const getWatchlistFromScreenerService = async (
    date: string
): Promise<string[]> => {
    return (await getFromService(
        Service.screener,
        "/watchlist/" + date
    )) as any;
};
