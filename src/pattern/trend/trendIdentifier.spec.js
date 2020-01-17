const test = require("ava");
const { getRecentTrend, TrendType } = require("./trendIdentifier.js");
const perfectUptrend = require("../fixtures/perfectUptrend.js");
const perfectDowntrend = require("../fixtures/perfectDowntrend.js");
const { getDayBars } = require("../../data/bars.js");

test("up trend", async t => {
  const trend = getRecentTrend(perfectUptrend);
  t.is(trend, TrendType.up);
});

test("down trend", async t => {
  const trend = getRecentTrend(perfectDowntrend);

  t.is(trend, TrendType.down);
});

const writeTestFixture = async (filename, symbol) => {
  const bars = await getDayBars([symbol]);
  require("fs").writeFileSync(
    "./src/pattern/fixtures/" + filename,
    JSON.stringify(bars[symbol])
  );
};
