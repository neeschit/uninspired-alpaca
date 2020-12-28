export const getSimpleAverage = (values: number[]) => {
    let sum = 0;
    return values.map((value, index) => {
        const oldSum = sum;
        sum = sum + value;
        return (value + oldSum) / (index + 1);
    });
};

export const getExponentialAverage = (
    values: number[],
    period = 14,
    sma = getSimpleAverage(values)
): number[] => {
    const smoother = 2 / (period + 1);
    let prevEma = sma[Math.max(sma.length - period - 1, 0)];

    return values.map(val => {
        prevEma = (val - prevEma) * smoother + prevEma;
        return prevEma;
    });
};
