import { getCompaniesByMarketCap } from "../libs/core-utils/data/marketcap";
import { writeFileSync } from "fs";

getCompaniesByMarketCap(50000000000).then((response) => {
    writeFileSync("./megacaps_new.json", JSON.stringify(response));
});
