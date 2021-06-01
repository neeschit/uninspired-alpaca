import { Calendar, TradeDirection } from "@neeschit/alpaca-trade-api";
import { isBoomBar } from "./screener";

test("isBoomBar for friday 4/30 AMGN", async () => {
    const fridayThirtiethApril = 1619789701000;
    const calendar: Calendar[] = [
        {
            date: "2021-04-30",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "AMGN";
    const screened = await isBoomBar({
        symbol,
        epoch: fridayThirtiethApril,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for monday 05/03/21 AMGN", async () => {
    const mayThird = 1620048901000;
    const calendar: Calendar[] = [
        {
            date: "2021-05-03",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "AMGN";
    const screened = await isBoomBar({
        symbol,
        epoch: mayThird,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for tuesday 05/25/21 SNAP", async () => {
    const date = 1621949701000;
    const calendar: Calendar[] = [
        {
            date: "2021-05-25",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "SNAP";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for tuesday 05/25/21 XOM", async () => {
    const date = 1621949701000;
    const calendar: Calendar[] = [
        {
            date: "2021-05-25",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "XOM";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual({
        side: TradeDirection.sell,
        limitPrice: 59,
    });
});

test("isBoomBar for tuesday 05/25/21 MU", async () => {
    const date = 1621949701000;
    const calendar: Calendar[] = [
        {
            date: "2021-05-25",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "MU";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual({
        side: TradeDirection.sell,
        limitPrice: 82.68,
    });
});

test("isBoomBar for tuesday 05/25/21 PDD", async () => {
    const date = 1621949701000;
    const calendar: Calendar[] = [
        {
            date: "2021-05-25",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "PDD";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for 01/14/21 MA", async () => {
    const date = 1610634901000;
    const calendar: Calendar[] = [
        {
            date: "2021-01-14",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "MA";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for 02/18/21 TWLO", async () => {
    const date = 1613658901000;
    const calendar: Calendar[] = [
        {
            date: "2021-02-18",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "TWLO";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual(null);
});

test("isBoomBar for 02/16/21 CVS", async () => {
    const date = 1613486101000;
    const calendar: Calendar[] = [
        {
            date: "2021-02-16",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "CVS";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toEqual({
        side: TradeDirection.sell,
        limitPrice: 73.9257,
    });
});
