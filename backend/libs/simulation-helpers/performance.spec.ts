import { readJSONSync } from "fs-extra";
import { getPerformance } from "./perfomance";

test("getPerformance", () => {
    const results = readJSONSync("./fixtures/test.json") as any[];
    const totalPnl = getPerformance(results);
    expect(totalPnl).toEqual(-25.527125729401213);
});
