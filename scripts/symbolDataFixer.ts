import { currentTradingSymbols } from "../data/filters";
import { deleteDailyBars } from "../libs/core-utils/resources/stockData";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../libs/core-utils/connection/pg";
import { addBusinessDays, endOfDay } from "date-fns";

const symbols = currentTradingSymbols;

async function run() {
    await deleteDailyBars(
        symbols,
        addBusinessDays(endOfDay(Date.now()), -1).getTime()
    );
}

run().then(endPooledConnection).catch(LOGGER.error);
