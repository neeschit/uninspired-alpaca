import { Calendar, TradeDirection } from "@neeschit/alpaca-trade-api";
import { isBoomBar } from "./screener";

test("isBoomBar for friday 4/30 AMGN", async () => {
    const fridayThirtiethApril = 1619789685000;
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
    const mayThird = 1620048885000;
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
    const date = 1621949685000;
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

test("isBoomBar for tuesday 05/25/21 MU", async () => {
    const date = 1621949685000;
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

    expect(screened).toEqual(
        expect.objectContaining({
            side: TradeDirection.sell,
            limitPrice: 82.83,
        })
    );
});

test("isBoomBar for tuesday 05/25/21 PDD", async () => {
    const date = 1621949685000;
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
    const date = 1610634885000;
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
    const date = 1613658885000;
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
    const date = 1613486085000;
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

    expect(screened).toEqual(
        expect.objectContaining({
            side: TradeDirection.sell,
            limitPrice: 73.95,
        })
    );
});

test("isBoomBar for 06/11/21 RCL", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "RCL";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeFalsy();
});

test("isBoomBar for 06/11/21 MCD", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "MCD";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeTruthy();
});

test("isBoomBar for 06/11/21 BMY", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "BMY";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeTruthy();
});

test("isBoomBar for 06/11/21 MRK", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "MRK";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeTruthy();
});

test("isBoomBar for 06/11/21 PFE", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "PFE";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeTruthy();
});

test("isBoomBar for 06/11/21 VFC", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "VFC";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeTruthy();
});

test("isBoomBar for 06/11/21 AAPL", async () => {
    const date = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "AAPL";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeFalsy();
});

test("isBoomBar for 02/28/20 AAPL", async () => {
    const date = 1582900485000;
    const calendar: Calendar[] = [
        {
            date: "2020-02-28",
            open: "09:30",
            close: "16:00",
        },
    ];
    const symbol = "AAPL";
    const screened = await isBoomBar({
        symbol,
        epoch: date,
        calendar,
    });

    expect(screened).toBeFalsy();
});
