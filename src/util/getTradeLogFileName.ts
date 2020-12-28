import DateFns from "date-fns";
import { TimestampType } from "../data/data.model.js";

const { format } = DateFns;

export const getPlannedLogs = (date: TimestampType = Date.now()) => {
    return "./tradePlans" + format(date, "yyyy-MM-dd") + ".json";
};
