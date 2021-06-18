import { nrbScreener } from "./nrbScreener";

test("nrb screened for ETSY 06/15 at 9:50 am", async () => {
    const nrbResult = await nrbScreener({
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

    expect(nrbResult).toBeTruthy();
    expect(nrbResult?.nrbToBoomRatio).toEqual(7.76);
    expect(nrbResult?.distanceFromBoomBarRange).toEqual(0);
    expect(nrbResult?.nrb).toEqual({
        o: 168.075,
        c: 167.8,
        h: 168.29,
        l: 167.71,
        v: 48661,
        t: "2021-06-15T13:45:00Z",
    });
    expect(nrbResult?.boomBarRetracementSoFar).toEqual(4.5 - 0.93);
    expect(nrbResult?.distanceFromVwap).toEqual(0.5);
});
