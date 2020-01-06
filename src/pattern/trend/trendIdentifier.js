const TrendType = {
  up: "up",
  down: "down",
  sideways: "sideways"
};

const getRecentTrend = barData => {
  if (!barData || !barData.length) {
    throw new Error();
  }

  const { max, min } = barData.reduce((previousValue, currentValue) => {
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
  }, {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  });

  const recentBars = barData.slice(-10).filter(d => d);

  

  return TrendType.up;
};

module.exports = {
  getRecentTrend,
  TrendType
};
