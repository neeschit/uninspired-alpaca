import downtrend from "./downtrend";
import getTrend from "./getTrend";
import { TrendType } from "../pattern/trend/trendIdentifier";

export default getTrend(downtrend, TrendType.sideways);
