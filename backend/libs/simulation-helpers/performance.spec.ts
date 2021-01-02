import { readJSONSync } from "fs-extra";
import { getPerformance } from "./perfomance";

test("getPerformance", () => {
    const results = readJSONSync("./fixtures/test.json") as any[];
    const totalPnl = getPerformance(results);
    expect(totalPnl).toEqual(-153.9390322031378);
});
