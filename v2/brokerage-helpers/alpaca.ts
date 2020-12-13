import Alpaca, { AlpacaOrder, AlpacaTradeConfig } from "@neeschit/alpaca-trade-api";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.ALPACA_SECRET_KEY_ID;

const SECRET_KEY = process.env.ALPACA_SECRET_KEY;

export const alpaca = Alpaca({
    keyId: API_KEY!,
    secretKey: SECRET_KEY!,
    paper: true,
    usePolygon: true,
});

export const cancelAlpacaOrder = (oid: string) => {
    return alpaca.cancelOrder(oid);
};

export const getOpenOrders = () => {
    return alpaca.getOrders({
        status: "open",
    });
};

export const getOpenPositions = () => {
    return alpaca.getPositions();
};

export const createBracketOrder = (order: AlpacaTradeConfig): Promise<AlpacaOrder> => {
    if (!order.qty || order.qty < 0) {
        throw new Error("quantity_required");
    }
    return alpaca.createOrder(order);
};

export const getConnectedDataWebsocket = (params: {
    onStockAggMin: (subject: string, data: string) => void;
    onStateChange: (state: string) => void;
    onConnect: () => void;
}) => {
    alpaca.data_ws.onStockAggMin(params.onStockAggMin);
    alpaca.data_ws.onConnect(params.onConnect);
    alpaca.data_ws.onStateChange(params.onStateChange);
    alpaca.data_ws.connect();

    return alpaca.data_ws;
};

export const getCalendar = (start: Date, end: Date) => {
    return alpaca.getCalendar({
        start,
        end,
    });
};
