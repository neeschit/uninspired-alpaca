import { PositionDirection } from "@neeschit/alpaca-trade-api";
import {
    createOrderSynchronized,
    deleteOrder,
    insertOrderForTradePlan,
    updateOrderWithAlpacaId,
} from "./order";
import { persistTradePlan, TradePlan } from "./position";
import { getOpenOrders, createBracketOrder } from "../brokerage-helpers";

jest.mock("../brokerage-helpers");

const mockGetOpenOrders = getOpenOrders as jest.Mock;

const mockCreateBracketOrder = createBracketOrder as jest.Mock;

const position: TradePlan = {
    entry: 157.66973888123042,
    limit_price: 157.66973888123042,
    stop: 156.79,
    symbol: "TEST",
    direction: PositionDirection.long,
    quantity: 159,
    target: 158.77480416092283,
};

test("crud plan and order in database", async () => {
    const insertedPlan = await persistTradePlan(position);

    const insertedOrder = await insertOrderForTradePlan(insertedPlan);

    if (insertedOrder) {
        await updateOrderWithAlpacaId(
            insertedOrder.id,
            "TEST" + Date.now().toString()
        );
    }

    expect(insertedOrder).toBeTruthy();
});
