const riskUnit = 100;

const assessRisk = (
    volumeProfile,
    atr,
    currentPrice,
    proposedEntryPrice,
    simpleStop
) => {
    const isShort = proposedEntryPrice < currentPrice;

    const minStop = atr.value;

    const proposedStopPrice = isShort
        ? Math.round(proposedEntryPrice + minStop)
        : Math.round(proposedEntryPrice - minStop);

    const isSafe = isShort
        ? proposedStopPrice > simpleStop
        : proposedStopPrice < simpleStop;

    const nearestVolumeProfileStop = volumeProfile.find(bar => {
        return bar.low <= proposedStopPrice && bar.high >= proposedStopPrice;
    });

    let stop = proposedStopPrice;

    if (nearestVolumeProfileStop) {
        const slippage = (Math.max(0.5, Math.random()) * atr.value) / 15;
        stop = isShort
            ? nearestVolumeProfileStop.high
            : nearestVolumeProfileStop.low;

        if (!isSafe) {
            stop = isShort ? stop + slippage : stop - slippage;
        }
    }

    return isShort ? stop - proposedEntryPrice : proposedEntryPrice - stop;
};

module.exports = {
    assessRisk
};
