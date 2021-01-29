import {
    getMarketRelativeVolume,
    selectAverageVolumeFirstBar,
    selectAverageVolumeFirstBarForWindow,
    selectAverageVolumeFirstBarForWindowLive,
} from "./firstFiveMinBar";
import { getData } from "./stockData";

test("selectAverageVolumeFirstBar for aapl", async () => {
    const averageVolApple = await selectAverageVolumeFirstBar("AAPL");

    expect(averageVolApple).toBeGreaterThan(6000000);
});

test("selectRecentAverage", async () => {
    const averageVolApple = await selectAverageVolumeFirstBarForWindow(
        "AAPL",
        90
    );

    expect(averageVolApple).toBeGreaterThan(5000000);
});

test("selectAverageVolumeFirstBarForWindowLive", async () => {
    const averageVolApple = await selectAverageVolumeFirstBarForWindowLive(
        "AAPL",
        90,
        1609361100000
    );

    expect(averageVolApple).toBeGreaterThan(6000000);
});

test("selectAverageVolumeFirstBarForWindowLive", async () => {
    const marketRelativeVolume = await getMarketRelativeVolume(1608301800000);
    expect(marketRelativeVolume).toBeGreaterThan(1.5);
});
