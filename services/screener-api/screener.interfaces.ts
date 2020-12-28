import { getFromService, Service } from "../../libs/core-utils/util/api";

export interface DailyWatchlist {
    atr: number;
    symbol: string;
}

export type GetWatchlistResponse = DailyWatchlist[];

export const getWatchlistFromScreenerService = async (
    date: string
): Promise<GetWatchlistResponse> => {
    return (await getFromService(
        Service.screener,
        "/watchlist/" + date
    )) as any;
};
