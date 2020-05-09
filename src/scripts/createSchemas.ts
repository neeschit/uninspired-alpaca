import {
    checkIfTableExistsForSymbol,
    createStorageTables,
    createMetadataTables,
    dropStorageTables,
} from "../resources/stockData";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../connection/pg";
import { getUnfilteredMegaCaps } from "../data/filters";

const drop = process.argv[2] && Boolean(process.argv[2]);

async function run() {
    const newSymbols = [];

    const symbols = getUnfilteredMegaCaps();

    symbols.push("SPY");

    drop && (await dropStorageTables(symbols));

    for (const symbol of symbols) {
        if (!(await checkIfTableExistsForSymbol(symbol))) {
            newSymbols.push(symbol);
        }
    }

    LOGGER.info(newSymbols);

    await createStorageTables(newSymbols);

    await createMetadataTables();

    await endPooledConnection();
}

run().then(() => {
    LOGGER.info("all done");
});
