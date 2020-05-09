import { VolumeProfileBar } from "../indicator/volumeProfile";
import { IndicatorValue } from "../indicator/adx";

export const TRADING_RISK_UNIT_CONSTANT = 100;

export const assessRisk = (
    volumeProfile: VolumeProfileBar[],
    atr: IndicatorValue<number>,
    currentPrice: number,
    proposedEntryPrice: number,
    simpleStop: number
) => {
    const isShort = proposedEntryPrice < currentPrice;

    const minStop = atr.value;

    const proposedStopPrice = isShort
        ? Math.round(proposedEntryPrice + minStop)
        : Math.round(proposedEntryPrice - minStop);

    const isSafe = isShort ? proposedStopPrice > simpleStop : proposedStopPrice < simpleStop;

    const nearestVolumeProfileStop = volumeProfile.find((bar) => {
        return bar.low <= proposedStopPrice && bar.high >= proposedStopPrice;
    });

    let stop = proposedStopPrice;

    if (nearestVolumeProfileStop) {
        const slippage = (Math.max(0.5, Math.random()) * atr.value) / 15;
        stop = isShort ? nearestVolumeProfileStop.high : nearestVolumeProfileStop.low;

        if (!isSafe) {
            stop = isShort ? stop + slippage : stop - slippage;
        }
    }

    return isShort ? stop - proposedEntryPrice : proposedEntryPrice - stop;
};
