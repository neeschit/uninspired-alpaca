import { getDayBars } from "../data/bars";
import { writeFileSync } from "fs";

const writeTextFixture = async (filename: string, symbol: string) => {
    const bars: any = await getDayBars([symbol]);
    const filePath = "./src/pattern/fixtures/" + filename;
    writeFileSync(filePath, JSON.stringify(bars[symbol]));
};

export default writeTextFixture;
