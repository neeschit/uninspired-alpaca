import { currentTradingSymbols } from "../data/filters";
import { deleteDailyBars } from "../resources/stockData";
import { LOGGER } from "../instrumentation/log";

const symbols = currentTradingSymbols;

for (const symbol of symbols) {
    deleteDailyBars(symbol, 1589725468000).catch(LOGGER.error);
}
