const DEFAULT_DMI_PERIOD = 14;

const getDirectionalMovementIndex = (bars, period = DEFAULT_DMI_PERIOD) => {
    if (!bars || bars.length < period + 1) {
        throw new Error("fix some shiz");
    }

    const [
        positiveDirectionalMovements,
        negativeDirectionalMovements
    ] = bars.reduce(
        (movementsArray, currentBar, index) => {
            const [
                positiveDirectionalMovements,
                negativeDirectionalMovements
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

    return [positiveDirectionalMovements, negativeDirectionalMovements, bars];
};

module.exports = {
    getDirectionalMovementIndex,
    DEFAULT_DMI_PERIOD
};
