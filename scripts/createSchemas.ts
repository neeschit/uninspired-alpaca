import {
    checkIfTableExistsForSymbol,
    createStorageTables,
    dropStorageTables,
    createDbIfNotExists,
    createNewMetadataTables,
} from "../resources/stockData";
import { LOGGER } from "../instrumentation/log";
import { endPooledConnection } from "../core/connection/pg";
import { getLargeCaps, currentIndices, getMegaCaps } from "../data/filters";

const drop = process.argv[2] && Boolean(process.argv[2]);

async function run() {
    const newSymbols = [];

    await createDbIfNotExists();

    await createNewMetadataTables();

    const symbols = getMegaCaps();

    symbols.push(...currentIndices);

    drop && (await dropStorageTables(symbols));

    for (const symbol of symbols) {
        if (!(await checkIfTableExistsForSymbol(symbol))) {
            newSymbols.push(symbol);
        }
    }

    LOGGER.info(newSymbols);

    await createStorageTables(newSymbols);

    await endPooledConnection();
}

run()
    .then(() => {
        LOGGER.info("all done");
    })
    .catch((e) => {
        console.error(e);
    });