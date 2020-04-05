import {
    checkIfTableExistsForSymbol,
    createStorageTables,
    createMetadataTables,
    insertBar,
    dropStorageTables,
    createDataTableForSymbol
} from "../resources/stockData";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../connection/pg";
import { getHighVolumeCompanies } from "../data/filters";

const drop = process.argv[2] && Boolean(process.argv[2]);

async function run() {
    const newSymbols = [];

    drop && (await dropStorageTables(getHighVolumeCompanies()));

    for (const symbol of getHighVolumeCompanies()) {
        if (!(await checkIfTableExistsForSymbol(symbol))) {
            newSymbols.push(symbol);
        }
    }

    LOGGER.info(newSymbols);

    await createStorageTables(newSymbols);

    if (!(await checkIfTableExistsForSymbol("SPY"))) {
        LOGGER.info(`creating table for SPY`);
        await createDataTableForSymbol("SPY");
    }

    await createMetadataTables();

    await endPooledConnection();
}

run().then(() => {
    LOGGER.info("all done");
});
