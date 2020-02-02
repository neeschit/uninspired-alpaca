const { getDayBars } = require("../../data/bars.js");
const { writeFileSync } = require("fs");

module.exports = async (filename, symbol) => {
    const bars = await getDayBars([symbol]);
    const filePath = "./src/pattern/fixtures/" + filename;
    writeFileSync(filePath, JSON.stringify(bars[symbol]));
};
