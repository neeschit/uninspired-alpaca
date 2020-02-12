import { parse } from "date-fns";

export * from "./get";
export const getDayForAlpacaTimestamp = (t: string | number) =>
    parse(t.toString(), "t", new Date(t));
