import {
    checkIfTableExistsForSymbol,
    createStorageTables,
    createMetadataTables
} from "../resources/stock_data";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../connection/pg";
import { getHighVolumeCompanies } from "../data/filters";

async function run() {
    const newSymbols = [];
    for (const symbol of getHighVolumeCompanies()) {
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
