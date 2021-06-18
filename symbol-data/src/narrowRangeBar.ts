import { SimpleBar } from "@neeschit/common-interfaces";
import { getAverageTrueRange } from "./trueRange";

export const getMinMaxPeriodRange = (
    tr: {
        value: number;
        t: string;
    }[]
) => {
    if (!tr.length) {
        throw new Error(
            "Expected at least one item when getting min/max Range"
        );
    }

    return tr.reduce(
        ({ min, max }, range) => {
            let newMin = min;
            let newMax = max;
            if (range.value < min.value) {
                newMin = range;
            }

            if (range.value > max.value) {
                newMax = range;
            }

            return {
                min: newMin,
                max: newMax,
            };
        },
        {
            min: {
                value: tr[0].value,
                t: tr[0].t,
            },
            max: {
                value: tr[0].value,
                t: tr[0].t,
            },
        }
    );
};

export const findNarrowestRange = ({
    tr,
}: {
    tr: {
        value: number;
        t: string;
    }[];
}) => {
    if (!tr.length) {
        throw new Error(
            "Expected at least one item when getting narrowest Range"
        );
    }

    const last7Ranges = tr.slice(-7).filter((r) => r);
    const { min } = getMinMaxPeriodRange(last7Ranges);

    return {
        min,
    };
};

export const findNarrowestBar = (bars: SimpleBar[]) => {
    if (!bars.length) {
        return;
    }
    try {
        const { tr } = getAverageTrueRange(bars, false);

        const { min: narrowestRange } = findNarrowestRange({ tr });

        return bars.find((bar) => bar.t === narrowestRange.t);
    } catch (e) {
        return;
    }
};
