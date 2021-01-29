import { getCompaniesByMarketCap } from "../libs/core-utils/data/marketcap";
import { writeFileSync } from "fs";

getCompaniesByMarketCap(10000000000).then((response) => {
    writeFileSync("./largecaps-new.json", JSON.stringify(response));
});
