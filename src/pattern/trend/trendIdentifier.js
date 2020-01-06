const TrendType = {
  up: "up",
  down: "down",
  sideways: "sideways"
};

const trendIdentifer = barData => {
  if (!barData || !barData.length) {
    throw new Error();
  }

  let recentTrend = null;
  let primaryUptrends = 0;
  let secondaryUptrends = 0;

  return TrendType.up;
};

module.exports = {
  trendIdentifer,
  TrendType
};
