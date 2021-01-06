import { mockBrokerage } from "../simulation-helpers/brokerage.mock";
import { SpyGapCloseSimulation } from "./spyGap.simulation";

jest.mock("../core-utils/resources/stockData", () => {
    const module = jest.requireActual("../core-utils/resources/stockData");
    return {
        ...module,
        batchInsertDailyBars: jest.fn(),
    };
});
jest.mock("../../services/trade-management-api/trade-manager.handlers");
jest.mock("../trade-management-helpers/order");

test("spy gap simulation on 12/29", async () => {
    const spyGapSimulation = new SpyGapCloseSimulation("SPY", mockBrokerage);

    await spyGapSimulation.beforeMarketStarts(1609250400000);

    expect(spyGapSimulation.isInPlay()).toEqual(true);
});
