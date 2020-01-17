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
  if (!barData || !barData.length || !barData.length > 1) {
    throw new Error();
  }

  const firstBarTrend =
    barData[1].c - barData[0].c > 0 ? TrendType.up : TrendType.down;
  const noChange = barData[1].c - barData[0].c === 0;

  const { closingTrend, highsTrend, lowsTrend } = barData.reduce(
    ({ closingTrend, highsTrend, lowsTrend }, bar, index) => {
      let newClosingTrend = closingTrend;
      let newHighsTrend = highsTrend;
      let newLowsTrend = lowsTrend;
      if (index) {
        newClosingTrend =
          bar.c - barData[index - 1].c > 0 ? TrendType.up : TrendType.down;
        newHighsTrend =
          bar.h - barData[index - 1].h > 0 ? TrendType.up : TrendType.down;
        newLowsTrend =
          bar.l - barData[index - 1].l > 0 ? TrendType.up : TrendType.down;
      }
      return {
        closingTrend: newClosingTrend,
        highsTrend: newHighsTrend,
        lowsTrend: newLowsTrend
      };
    },
    {
      closingTrend: firstBarTrend,
      highsTrend: firstBarTrend,
      lowsTrend: firstBarTrend
    }
  );

  console.log(closingTrend);

  return closingTrend;
};

module.exports = {
  getRecentTrend,
  TrendType
};
