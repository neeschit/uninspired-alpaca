const TrendType = {
    up: "up",
    down: "down",
    sideways: "sideways"
};

const getMaxMin = barData => {
    return barData.reduce(
        (previousValue, currentValue) => {
            let { max: prevMax, min: prevMin } = previousValue;
            if (currentValue.h > prevMax) {
                prevMax = currentValue.h;
            }

            if (currentValue.l < prevMin) {
                prevMin = currentValue.l;
            }

            return {
                max: prevMax,
                min: prevMin
            };
        },
        {
            min: Number.MAX_SAFE_INTEGER,
            max: Number.MIN_SAFE_INTEGER
        }
    );
};

const getRecentTrend = barData => {
    if (!barData || !barData.length) {
        throw new Error();
    }

    const closingPrices = [];

    for (let i = 1; i < barData.length; i++) {
        const diff = barData[i].c - barData[i - 1].c;
        closingPrices.push(diff);
    }

    const summer = (sum => value => (sum += value))(0);

    const closingPriceDiffPrefixSum = closingPrices.map(summer);

    console.log(closingPriceDiffPrefixSum);

    return TrendType.up;
};

module.exports = {
    getRecentTrend,
    TrendType
};
