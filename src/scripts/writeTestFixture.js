const { getDayBars } = require("../data/bars.js");
const { writeFileSync } = require("fs");

const symbol = process.argv[2];
getDayBars([symbol]).then(bars => {
    const filePath = "./src/fixtures/" + process.argv[3];
    console.log(typeof bars);
    writeFileSync(filePath, JSON.stringify(bars[symbol][0]));
});
