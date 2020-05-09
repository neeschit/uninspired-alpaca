import { getApiServer, Service } from "../util/api";
import { getTodaysData, getYesterdaysEndingBars, insertBar } from "../resources/stockData";
import { Bar, TickBar } from "../data/data.model";
import { getMinutes } from "date-fns";

const server = getApiServer(Service.data);

const minuteDataCache: { [symbol: string]: Bar[] } = {};
const fiveMinuteDataCache: { [symbol: string]: Bar[] } = {};

server.get("/adx", async (request, reply) => {});

server.get("/bars/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    if (!fiveMinuteDataCache[symbol]) {
        await cacheBars(symbol, epoch);
    }

    return fiveMinuteDataCache[symbol].filter((b) => b.t <= epoch);
});

server.get("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;
    const { epoch = Date.now() } = request.query || {};

    if (!fiveMinuteDataCache[symbol]) {
        await cacheBars(symbol, epoch);
    }

    const filteredBars = fiveMinuteDataCache[symbol].filter((b) => b.t <= epoch);

    return filteredBars.length ? filteredBars[filteredBars.length - 1] : [];
});

server.post("/bar/:symbol", async (request, reply) => {
    const symbol = request.params && request.params.symbol;

    const bar: TickBar = request.body;

    await insertBar(bar, symbol, true);

    const minutes = getMinutes(bar.t);

    const isRefreshMinute = minutes % 5 === 4;

    fiveMinuteDataCache[symbol] = fiveMinuteDataCache[symbol] || [];

    const data = fiveMinuteDataCache[symbol];

    const lastEpoch = data && data[data.length - 1].t;

    if (isRefreshMinute) {
        const bars = await getTodaysData(symbol, bar.t, lastEpoch);

        fiveMinuteDataCache[symbol].push(...bars);
    }

    return {
        success: true,
    };
});

const cacheBars = async (symbol: string, currentEpoch = Date.now()) => {
    const todayFiveMinutes = await getTodaysData(symbol, currentEpoch);
    const ydayFiveMinutes = await getYesterdaysEndingBars(symbol, currentEpoch);

    const screenerData = [];

    screenerData.push(...ydayFiveMinutes.reverse());
    screenerData.push(...todayFiveMinutes);

    fiveMinuteDataCache[symbol] = screenerData;
};
