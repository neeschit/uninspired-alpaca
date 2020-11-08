import { PositionDirection, TradeType } from "@neeschit/alpaca-trade-api";
import {
    convertPlanToAlpacaBracketOrder,
    PersistedUnfilledOrder,
} from "./order";

jest.mock("../brokerage-helpers");

import { TradePlan } from "../trade-management-helpers";

test("convert to bracket order", async () => {
    const plan: TradePlan = {
        entry: 157.7324020804614,
        limit_price: 157.66973888123042,
        stop: 158.79,
        symbol: "CCI",
        direction: PositionDirection.short,
        quantity: -159,
        target: 156.67480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
        stop_price: plan.entry,
        type: TradeType.stop_limit,
    } as PersistedUnfilledOrder);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toEqual(plan.entry);
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.stop_limit);
});

test("convert to bracket order - 2", async () => {
    const plan: TradePlan = {
        entry: 157.66973888123042,
        limit_price: 157.66973888123042,
        stop: 156.79,
        symbol: "CCI",
        direction: PositionDirection.long,
        quantity: 159,
        target: 158.77480416092283,
    };

    const bracketOrder = convertPlanToAlpacaBracketOrder(plan, {
        id: 1,
        type: TradeType.limit,
    } as PersistedUnfilledOrder);

    expect(bracketOrder.order_class).toEqual("bracket");
    expect(bracketOrder.take_profit).toBeTruthy();
    expect(bracketOrder.take_profit!.limit_price).toEqual(plan.target);
    expect(bracketOrder.stop_loss).toBeTruthy();
    expect(bracketOrder.stop_loss!.stop_price).toEqual(plan.stop);
    expect(bracketOrder.stop_price).toBeFalsy();
    expect(bracketOrder.limit_price).toEqual(plan.limit_price);
    expect(bracketOrder.qty).toBeGreaterThan(0);
    expect(bracketOrder.type).toEqual(TradeType.limit);
});
