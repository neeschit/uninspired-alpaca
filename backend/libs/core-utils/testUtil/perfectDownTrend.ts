import getTrend from "./getTrend";
import { TrendType } from "../../core-indicators/pattern/trend/trendIdentifier";
import { readJSONSync } from "fs-extra";

const downtrend = readJSONSync("./fixtures/downtrend.json") as any;

export default getTrend(downtrend, TrendType.down);
