import test from "ava";

import { checkIfPositionsNeedRefreshing } from "./manager.handlers";
import { SimpleAlpacaPosition } from "@neeschit/alpaca-trade-api";
import { TradeDirection } from "../data/data.model";

test("positions out of sync in db are identfied", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {
        test: {
            symbol: "test",
            avg_entry_price: "15",
            qty: "10",
        },
    };

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 0,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});

test("positions out of sync in db on quantity alone are identified", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {
        test: {
            symbol: "test",
            avg_entry_price: "15",
            qty: "10",
        },
    };

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 15,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});

test("non-existent positions need to be reset", async (t) => {
    const alpacaPositionsMap: { [index: string]: SimpleAlpacaPosition } = {};

    const dbPositions = [
        {
            id: 1,
            planned_entry_price: 200,
            planned_stop_price: 100,
            planned_quantity: 100,
            quantity: 100,
            symbol: "test",
            side: TradeDirection.buy,
            average_entry_price: 15,
        },
    ];

    const unequalPositions = checkIfPositionsNeedRefreshing(alpacaPositionsMap, dbPositions);

    t.is(unequalPositions.length, 1);
});
