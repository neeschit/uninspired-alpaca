import { readJsonSync } from "fs-extra";
import {
    batchInsertDailyBars,
    checkIfTableExistsForSymbol,
    createAggregatedDailyDataTableForSymbol,
    createAggregatedMinutesDataTableForSymbol,
} from "../../src/resources/stockData";
import { onStockMinuteDataPosted } from "./orchestrator";
import {
    getOpenPositions,
    getOpenOrders,
    createBracketOrder,
} from "../brokerage-helpers";

jest.mock("../brokerage-helpers");

const mockPositions = getOpenPositions as jest.Mock;
const mockOrders = getOpenOrders as jest.Mock;
const mockCreate = createBracketOrder as jest.Mock;

jest.mock("../trade-management-api", () => {
    const { enterSymbol } = jest.requireActual(
        "../trade-management-api/trade-manager.handlers"
    );

    return {
        enterSymbolForTrade: enterSymbol,
    };
});

jest.mock("../screener-api", () => {
    const { getWatchlistForDate } = jest.requireActual(
        "../screener-api/screener.handlers"
    );

    return {
        getWatchlistFromScreenerService: getWatchlistForDate.bind({}, ["TEST"]),
    };
});

jest.setTimeout(10000);

beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
});

test("onStockMinuteAggPosted", async () => {
    const dailyData = readJsonSync("./fixtures/jnj-nrb.json");

    try {
        if (!(await checkIfTableExistsForSymbol("TEST"))) {
            await createAggregatedDailyDataTableForSymbol("TEST");
            await createAggregatedMinutesDataTableForSymbol("TEST");
        }

        await batchInsertDailyBars(dailyData, "TEST");
    } catch (e) {
        console.error(e);
    }

    const minuteData = readJsonSync("./fixtures/jnj-replay-10-28-2020.json");

    mockPositions.mockResolvedValueOnce([]);
    mockOrders.mockReturnValueOnce([]);

    for (let i = 0; i < 30; i++) {
        const d = minuteData[i];
        d.s = d.t;
        await onStockMinuteDataPosted("test", JSON.stringify([d]), d.t);
    }
});
