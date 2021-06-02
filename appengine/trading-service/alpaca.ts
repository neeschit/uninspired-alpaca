import Alpaca, {
    Alpaca as AlpacaClass,
    OrderStatus,
} from "@neeschit/alpaca-trade-api";
import { currentTradingSymbols, getCacheKey } from "@neeschit/core-data";
import { requestScreen } from "./publishMessage";
import { getRedisApi } from "./redis";

export const getEntryCacheKey = (symbol: string, epoch: number) => {
    return getCacheKey(`${symbol}_entering_trade`, epoch);
};

export let alpaca: AlpacaClass;

export const setupAlpaca = () => {
    alpaca = Alpaca({
        keyId: process.env.ALPACA_SECRET_KEY_ID!,
        secretKey: process.env.ALPACA_SECRET_KEY!,
        paper: true,
        usePolygon: false,
    });
};

export async function setupAlpacaStreams() {
    setupAlpaca();

    const { promiseSet } = getRedisApi();

    const calendar = await alpaca.getCalendar({
        start: new Date(Date.now()),
        end: new Date(Date.now()),
    });

    const stream = alpaca.data_stream_v2;

    stream.connect();

    stream.onConnect(() => stream.subscribeForBars(currentTradingSymbols));

    stream.onStockBar(async (bar) => {
        await requestScreen(bar.S, calendar);
    });

    const trade_ws = alpaca.trade_ws;

    trade_ws.connect();

    trade_ws.onConnect(() => {
        trade_ws.subscribe(["trade_updates"]);
    });

    trade_ws.onOrderUpdate(async (update) => {
        console.log(update);
        const symbol = update.order.symbol;
        if (
            update.order &&
            (update.order.status === OrderStatus.filled ||
                update.order.status === OrderStatus.canceled ||
                update.order.status === OrderStatus.expired)
        )
            await promiseSet(getEntryCacheKey(symbol, Date.now()), "false");
    });
}

export const disconnectAlpacaStreams = () => {
    alpaca.trade_ws.disconnect();
    alpaca.data_stream_v2.disconnect();
};
