import Alpaca, { Alpaca as AlpacaClass } from "@neeschit/alpaca-trade-api";
import { currentTradingSymbols, getCacheKey } from "@neeschit/core-data";
import { requestScreen } from "./publishMessage";

export const getEntryCacheKey = (symbol: string, epoch: number) => {
    return getCacheKey(`${symbol}_entering_trade`, epoch);
};

export let alpaca: AlpacaClass;

export function setupAlpacaStreams(
    promiseSet: (key: string, value: string) => Promise<any>
) {
    alpaca = Alpaca({
        keyId: process.env.ALPACA_SECRET_KEY_ID!,
        secretKey: process.env.ALPACA_SECRET_KEY!,
        paper: true,
        usePolygon: false,
    });

    const stream = alpaca.data_stream_v2;

    stream.connect();

    stream.onConnect(() => stream.subscribeForBars(currentTradingSymbols));

    stream.onStockBar(async (bar) => {
        await requestScreen(bar.S);
    });

    const trade_ws = alpaca.trade_ws;

    trade_ws.connect();

    trade_ws.onConnect(() => {
        trade_ws.subscribe(["trade_updates"]);
    });

    trade_ws.onOrderUpdate(async (update) => {
        const symbol = update.order.symbol;
        await promiseSet(getEntryCacheKey(symbol, Date.now()), "false");
    });
}

export const disconnectAlpacaStreams = () => {
    alpaca.trade_ws.disconnect();
    alpaca.data_stream_v2.disconnect();
};
