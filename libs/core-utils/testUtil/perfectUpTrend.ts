import getTrend from "./getTrend";
import { readJSONSync } from "fs-extra";

const uptrend = readJSONSync("./fixtures/uptrend.json") as any;

export default getTrend(uptrend);
