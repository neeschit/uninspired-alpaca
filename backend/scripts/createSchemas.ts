import {
    checkIfTableExistsForSymbol,
    createStorageTables,
    dropStorageTables,
    createDbIfNotExists,
    createNewMetadataTables,
} from "../libs/core-utils/resources/stockData";
import { LOGGER } from "../libs/core-utils/instrumentation/log";
import { endPooledConnection } from "../libs/core-utils/connection/pg";
import { getLargeCaps, currentIndices, getMegaCaps } from "@neeschit/core-data";

const drop = process.argv[2] && Boolean(process.argv[2]);

async function run() {
    const newSymbols = [];

    await createDbIfNotExists();

    await createNewMetadataTables();

    const symbols = getLargeCaps();

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
