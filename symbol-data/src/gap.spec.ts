import { Calendar } from "@neeschit/alpaca-trade-api";
import { getGapPercentage } from "./gap";

test("getGapPercentage for 06/25/21 NKE", async () => {
    const epoch = 1624628085000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-25",
            open: "09:30",
            close: "16:00",
        },
    ];

    const { gap } = await getGapPercentage({
        symbol: "NKE",
        epoch,
        calendar,
        limit: 1,
    });

    expect(gap).toBeGreaterThanOrEqual(14.03);
});

test("getGapPercentage for 06/11/21 RCL", async () => {
    const epoch = 1623418485000;
    const calendar: Calendar[] = [
        {
            date: "2021-06-11",
            open: "09:30",
            close: "16:00",
        },
    ];

    const { gap } = await getGapPercentage({
        symbol: "RCL",
        epoch,
        calendar,
        limit: 1,
    });

    expect(gap).toBeLessThanOrEqual(-2.43);
});
