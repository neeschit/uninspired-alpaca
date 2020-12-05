import { Simulator } from "../simulation-helpers";

const startDate = "2020-11-25 09:00:00.000";
const endDate = "2020-11-25 16:30:00.000";

test("backtester", async () => {
    const simulator = new Simulator({
        startDate,
        endDate,
    });
});
