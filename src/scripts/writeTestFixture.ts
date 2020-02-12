import { getDayBars } from "../data/bars";
import { writeFileSync } from "fs";

const symbol = process.argv[2];
getDayBars([symbol]).then((bars: any) => {
    const filePath = "./src/fixtures/" + process.argv[3];
    writeFileSync(filePath, JSON.stringify(bars[symbol][0]));
});
