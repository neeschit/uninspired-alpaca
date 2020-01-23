const DEFAULT_DMI_PERIOD = 14;
const { getDirectionalMovementIndex } = require("./dmi.js");
const { getExponentialAverage } = require("./average.js");
const { getAverageTrueRange } = require("./trueRange.js");

const getAverageDirectionalIndex = (bars, period = DEFAULT_DMI_PERIOD) => {
    const [
        positiveDirectionalMovements,
        negativeDirectionalMovements
    ] = getDirectionalMovementIndex(bars);

    const atr = getAverageTrueRange(bars, period);

    const [pdx, ndx] = positiveDirectionalMovements.reduce(
        ([pdx, ndx], positiveMovement, index) => {
            const negativeMovement = negativeDirectionalMovements[index];
            if (positiveMovement >= negativeMovement && positiveMovement > 0) {
                pdx.push(positiveMovement);
                ndx.push(0);
            } else if (
                positiveMovement <= negativeMovement &&
                negativeMovement > 0
            ) {
                pdx.push(0);
                ndx.push(negativeMovement);
            } else {
                ndx.push(0);
                pdx.push(0);
            }

            return [pdx, ndx];
        },
        [[], []]
    );

    const mappedPdx = getExponentialAverage(pdx).map((v, index) => {
        let volatilitySmoother = atr[index] / 100;
        return v * volatilitySmoother;
    });
    const mappedNdx = getExponentialAverage(ndx).map((v, index) => {
        let volatilitySmoother = atr[index] / 100;
        return v * volatilitySmoother;
    });

    const adxToBe = mappedPdx.map((pdxval, index) => {
        const pVal = pdxval;
        const nVal = mappedNdx[index];

        return Math.abs(pVal - nVal) / Math.abs(pVal + nVal);
    });

    const adx = getExponentialAverage(adxToBe, 14).map(v => v * 100);

    return [adx, mappedPdx, mappedNdx];
};

module.exports = {
    getAverageDirectionalIndex
};
