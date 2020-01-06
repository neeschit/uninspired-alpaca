const test = require("ava");
const { getRecentTrend, TrendType } = require("./trendIdentifier.js");
const uptrend = require("../fixtures/uptrend");
const downtrend = require("../fixtures/downtrend");
const { getDayBars } = require("../../data/bars.js");

test("up trend", async t => {
  const trend = getRecentTrend(uptrend);
  t.is(trend, TrendType.up);
});

test("down trend", async t => {
  const trend = getRecentTrend(downtrend);

  t.is(trend, TrendType.down);
});

const writeTestFixture = async (filename, symbol) => {
  const bars = await getDayBars([symbol]);
  require("fs").writeFileSync(
    "./src/pattern/fixtures/" + filename,
    JSON.stringify(bars[symbol])
  );
};
