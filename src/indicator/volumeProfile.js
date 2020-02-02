module.exports = {
    getVolumeProfile: bars => {
        const { min, max, maxVolumeBar, sumVolume } = bars.reduce(
            ({ min, max, maxVolumeBar, sumVolume }, bar, index) => {
                if (bar.c > max) {
                    max = bar.c;
                }
                if (bar.c < min) {
                    min = bar.c;
                }

                if (bar.v > maxVolumeBar.v) {
                    maxVolumeBar = bar;
                }

                return {
                    min: Math.floor(min),
                    max: Math.ceil(max),
                    sumVolume: sumVolume + bar.v,
                    maxVolumeBar
                };
            },
            {
                min: 100000,
                max: 0,
                maxVolumeBar: {
                    c: 0,
                    v: 0
                },
                sumVolume: 0
            }
        );

        let steps = [];

        for (let i = min; i <= max; i++) {
            steps.push({
                min,
                max: min + 1
            });
        }

        return maxVolumeBar;
    }
};
