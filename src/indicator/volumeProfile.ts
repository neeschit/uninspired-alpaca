import { Bar } from "../data/data.model.js";

export interface VolumeProfileBar {
    low: number;
    high: number;
    v: number;
}

export const getVolumeProfile = (bars: Bar[]): VolumeProfileBar[] => {
    const { min, max, sumVolume } = bars.reduce(
        ({ min, max, sumVolume }, bar, index) => {
            if (bar.c > max) {
                max = bar.c;
            }
            if (bar.c < min) {
                min = bar.c;
            }

            return {
                min: Math.floor(min),
                max: Math.ceil(max),
                sumVolume: sumVolume + bar.v,
            };
        },
        {
            min: 100000,
            max: 0,
            sumVolume: 0,
        }
    );

    const barsSortedByVolume = bars.slice().sort((bar1, bar2) => {
        return bar1.v > bar2.v ? -1 : 1;
    });

    const volumeProfile: VolumeProfileBar[] = [];

    for (let i = 0; i < barsSortedByVolume.length; i++) {
        const bar = bars[i];

        const index = max - Math.round(bar.c);

        volumeProfile[index] = volumeProfile[index]
            ? volumeProfile[index]
            : { v: 0, low: 1000000, high: 0 };

        volumeProfile[index].v += bar.v;
        volumeProfile[index].low = Math.floor(bar.c);
        volumeProfile[index].high = Math.ceil(bar.c);
    }

    return volumeProfile
        .filter((profile) => profile)
        .reduce(
            (
                mergedArray: VolumeProfileBar[],
                val: VolumeProfileBar,
                index,
                array
            ) => {
                const orig = array.filter((foundVal, foundIndex) => {
                    return val.low === foundVal.low && foundIndex < index;
                });

                if (!orig || !orig.length) {
                    mergedArray.push(val);
                } else {
                    orig[0].v += val.v;
                }
                return mergedArray;
            },
            []
        )
        .sort((p1: VolumeProfileBar, p2: VolumeProfileBar) =>
            p1.v > p2.v ? -1 : 1
        );
};

export const getNextResistance = (
    bars: Bar[],
    isShort: boolean,
    entryPrice: number,
    volumeProfile = getVolumeProfile(bars)
) => {
    const ranges = volumeProfile.filter((profile) => {
        if (isShort) {
            return profile.high <= entryPrice;
        }
        return profile.low >= entryPrice;
    });
    return ranges.map((range) => {
        return isShort ? range.high : range.low;
    });
};
