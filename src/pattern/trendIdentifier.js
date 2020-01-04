export const TrendType = {
  up: "up",
  down: "down",
  sideways: "sideways"
};

export const trendIdentifer = barData => {
  if (!barData || !barData.length) {
    throw new Error();
  }

  return TrendType.up;
};
