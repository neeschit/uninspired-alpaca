import { format } from "date-fns";

export const getCacheKey = (key: string, epoch: number): string => {
    return `${key.toLowerCase()}_${format(epoch, "yyyy_MM_dd")}`;
};

export const getBoomRequestCacheKey = (epoch: number): string => {
    return getCacheKey("boom_requested_count", epoch);
};

export const getWatchlistCacheKey = (epoch: number) => {
    return getCacheKey("boom_watchlist", epoch);
};
