import { currentTradingSymbols } from "../data/filters";
import { deleteDailyBars } from "../resources/stockData";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../connection/pg";
import DateFns from "date-fns";

const { addBusinessDays, endOfDay } = DateFns;

const symbols = currentTradingSymbols;

async function run() {
    await deleteDailyBars(
        symbols,
        addBusinessDays(endOfDay(Date.now()), -1).getTime()
    );
}

run().then(endPooledConnection).catch(LOGGER.error);
