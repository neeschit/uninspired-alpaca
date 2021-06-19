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

test("nrb screened for LLY 06/15 at 10:20 am", async () => {
    const nrbResult = await nrbScreener({
        symbol: "LLY",
        epoch: 1623766800000,
        calendar: [
            {
                date: "2021-06-15",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(nrbResult).toBeTruthy();
    expect(nrbResult?.nrbToBoomRatio).toEqual(4.81);
    expect(nrbResult?.distanceFromBoomBarRange).toEqual(1.05);
    expect(nrbResult?.nrb).toEqual({
        o: 224.41,
        c: 224.14,
        h: 224.4458,
        l: 224.14,
        v: 11048,
        t: "2021-06-15T14:20:00Z",
    });
    expect(nrbResult?.boomBarRetracementSoFar).toEqual(1.19);
    expect(nrbResult?.distanceFromVwap).toEqual(0.82);
});

test("nrb screened for MCD 06/16 at 10:05 am", async () => {
    const nrbResult = await nrbScreener({
        symbol: "MCD",
        epoch: 1623852300000,
        calendar: [
            {
                date: "2021-06-16",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(nrbResult).toBeFalsy();
});

test("nrb screened for ADBE 06/16 at 09:45 am", async () => {
    const nrbResult = await nrbScreener({
        symbol: "ADBE",
        epoch: 1623851400000,
        calendar: [
            {
                date: "2021-06-16",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(nrbResult).toBeTruthy();
    expect(nrbResult?.nrbToBoomRatio).toEqual(3.98);
    expect(nrbResult?.distanceFromBoomBarRange).toEqual(0);
    expect(nrbResult?.nrb).toEqual({
        o: 550.87,
        c: 550.19,
        h: 551.43,
        l: 550.19,
        v: 28993,
        t: "2021-06-16T13:45:00Z",
    });
    expect(nrbResult?.boomBarRetracementSoFar).toEqual(1.75);
    expect(nrbResult?.distanceFromVwap).toEqual(-0.03);
});

test("nrb screened for CL 06/16 at 09:45 am", async () => {
    const nrbResult = await nrbScreener({
        symbol: "CL",
        epoch: 1623851400000,
        calendar: [
            {
                date: "2021-06-16",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(nrbResult).toBeTruthy();
    expect(nrbResult?.nrbToBoomRatio).toEqual(5.71);
    expect(nrbResult?.distanceFromBoomBarRange).toEqual(0);
    expect(nrbResult?.nrb).toEqual({
        o: 83.5,
        c: 83.52,
        h: 83.605,
        l: 83.5,
        v: 36232,
        t: "2021-06-16T13:40:00Z",
    });
    expect(nrbResult?.boomBarRetracementSoFar).toEqual(0.3);
    expect(nrbResult?.distanceFromVwap).toEqual(0.01);
});

test("nrb screened for PGR 06/17 at 09:40 am", async () => {
    const nrbResult = await nrbScreener({
        symbol: "PGR",
        epoch: 1623937200000,
        calendar: [
            {
                date: "2021-06-17",
                open: "09:30",
                close: "16:00",
            },
        ],
    });

    expect(nrbResult).toBeTruthy();
    expect(nrbResult?.nrb).toEqual({
        o: 92.34,
        c: 92.46,
        h: 92.5893,
        l: 92.28,
        v: 29294,
        t: "2021-06-17T13:35:00Z",
    });
    expect(nrbResult?.nrbToBoomRatio).toEqual(3.36);
    expect(nrbResult?.distanceFromBoomBarRange).toEqual(0);
    expect(nrbResult?.boomBarRetracementSoFar).toEqual(0.65);
    expect(nrbResult?.distanceFromVwap).toEqual(0.45);
});
