import { getDirectionalMovementIndex, DEFAULT_DMI_PERIOD } from "./dmi.js";
import { getExponentialAverage } from "./average.js";
import { getAverageTrueRange } from "./trueRange.js";
import { Bar } from "../data/data.model.js";

export interface IndicatorValue<X> {
    value: X;
    t: number;
}

export const getAverageDirectionalIndex = (
    bars: Bar[],
    useSimpleRange = false,
    period = DEFAULT_DMI_PERIOD
) => {
    const { pdmi, ndmi } = getDirectionalMovementIndex(bars);

    const { atr, tr } = getAverageTrueRange(bars, useSimpleRange, period);

    const [pdx, ndx] = pdmi.reduce(
        ([pdx, ndx]: number[][], positiveMovement: number, index: number) => {
            const negativeMovement = ndmi[index];
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
        [[] as number[], [] as number[]]
    );

    const mappedPdx = getExponentialAverage(pdx, 27).map((v, index) => {
        let volatilitySmoother = atr[index].value / 100;
        return v / volatilitySmoother;
    });
    const mappedNdx = getExponentialAverage(ndx, 27).map((v, index) => {
        let volatilitySmoother = atr[index].value / 100;
        return v / volatilitySmoother;
    });

    const adxToBe = mappedPdx.map((pdxval, index) => {
        const pVal = pdxval;
        const nVal = mappedNdx[index];

        return Math.abs((pVal - nVal) / (pVal + nVal === 0 ? 1 : pVal + nVal));
    });

    const adx = getExponentialAverage(adxToBe, 27).map(
        (v, index, adxArray) => ({
            value: v * 100,
            t: bars[bars.length - adxArray.length].t,
        })
    );

    return { adx, pdx: mappedPdx, ndx: mappedNdx, atr, tr };
};
