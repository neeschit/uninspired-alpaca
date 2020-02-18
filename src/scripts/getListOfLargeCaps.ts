import  { getCompaniesByMarketCap } from "../data/marketcap"
import  { writeFileSync } from "fs"

getCompaniesByMarketCap(10000000000).then(response => {
    writeFileSync("./largecaps.json", JSON.stringify(response));
});