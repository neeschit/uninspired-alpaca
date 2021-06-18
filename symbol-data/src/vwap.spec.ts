import { getVwap, getVwapFromBars } from "./vwap";

jest.setTimeout(100000);

test("getVwap for ETSY on 6/15 at 9:50 am", async () => {
    const vwap = await getVwap({
        symbol: "ETSY",
        epoch: 1623765000000,
        calendar: [
            {
                date: "2021-06-15",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(vwap).toEqual(168.79);
});

test("getVwapFromBars for ETSY on 6/15 at 9:50 am", async () => {
    const vwap = await getVwapFromBars({
        symbol: "ETSY",
        epoch: 1623765000000,
        calendar: [
            {
                date: "2021-06-15",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(vwap).toEqual(168.21);
});

test("getVwapFromBars for AAPL on 6/18 at 09:50 am", async () => {
    const vwap = await getVwapFromBars({
        symbol: "AAPL",
        epoch: 1624024200000,
        calendar: [
            {
                date: "2021-06-18",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(vwap).toEqual(130.98);
});
