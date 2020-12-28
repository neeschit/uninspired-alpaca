import { format } from "date-fns";
import { TimestampType } from "../data/data.model";

export const getPlannedLogs = (date: TimestampType = Date.now()) => {
    return "./tradePlans" + format(date, "yyyy-MM-dd") + ".json";
};
