import { Bar } from "../../core-utils/data/data.model";

export const DEFAULT_DMI_PERIOD = 14;

export const getDirectionalMovementIndex = (
    bars: Bar[],
    period = DEFAULT_DMI_PERIOD
) => {
    if (!bars) {
        throw new Error("fix some shiz cos no bars");
    }

    const [pdmi, ndmi] = bars.reduce(
        (movementsArray: number[][], currentBar: Bar, index) => {
            const [
                positiveDirectionalMovements,
                negativeDirectionalMovements,
            ] = movementsArray;
            if (index) {
                positiveDirectionalMovements.push(
                    currentBar.h - bars[index - 1].h
                );
                negativeDirectionalMovements.push(
                    bars[index - 1].l - currentBar.l
                );
            }

            return movementsArray;
        },
        [[], []]
    );

    return { pdmi, ndmi };
};
