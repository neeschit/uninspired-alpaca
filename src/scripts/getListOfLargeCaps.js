const { getCompaniesByMarketCap } = require("../data/marketcap.js");
const { writeFileSync } = require("fs");

getCompaniesByMarketCap(10000000000).then(response => {
    writeFileSync("./largecaps.json", JSON.stringify(response));
});
