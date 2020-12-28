import { currentTradingSymbols } from "../libs/core-utils/data/filters";
import { LOGGER } from "../libs/core-utils/instrumentation/log";
import { deleteDailyBars } from "../libs/core-utils/resources/stockData";
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
