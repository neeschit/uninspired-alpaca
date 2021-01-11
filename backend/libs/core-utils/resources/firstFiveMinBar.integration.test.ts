import {
    selectAverageVolumeFirstBar,
    selectAverageVolumeFirstBarForWindow,
} from "./firstFiveMinBar";

test("selectAverageVolumeFirstBar for aapl", async () => {
    const averageVolApple = await selectAverageVolumeFirstBar("AAPL");

    expect(averageVolApple).toBeGreaterThan(6000000);
});

test("selectRecentAverage", async () => {
    const averageVolApple = await selectAverageVolumeFirstBarForWindow(
        "AAPL",
        90
    );

    expect(averageVolApple).toBeGreaterThan(6000000);
});
