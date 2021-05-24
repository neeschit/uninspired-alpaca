import { format } from "date-fns";

export const getCacheKey = (key: string, epoch: number): string => {
    return `${key.toLowerCase()}_${format(epoch, "yyyy_MM_dd")}`;
};
