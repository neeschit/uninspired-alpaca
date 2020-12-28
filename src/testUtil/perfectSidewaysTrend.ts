import getTrend from "./getTrend";
import { TrendType } from "../pattern/trend/trendIdentifier";
import { readJSONSync } from "fs-extra";

const downtrend = readJSONSync("./fixtures/downtrend.json") as any;

export default getTrend(downtrend, TrendType.sideways);
