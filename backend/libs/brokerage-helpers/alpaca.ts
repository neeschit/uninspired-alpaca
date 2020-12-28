import Alpaca, {
    AlpacaTradeConfig,
    AlpacaOrder,
} from "@neeschit/alpaca-trade-api";
import * as dotenv from "dotenv";
import { LOGGER } from "../core-utils/instrumentation/log";

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

export const createBracketOrder = (
    order: AlpacaTradeConfig
): Promise<AlpacaOrder> => {
    if (!order.qty || order.qty < 0) {
        throw new Error("quantity_required");
    }
    return alpaca.createOrder(order);
};

export const getConnectedDataWebsocket = (params: {
    onStockAggMin: (subject: string, data: string) => void;
    onConnect: () => void;
}) => {
    alpaca.data_ws.onStockAggMin(params.onStockAggMin);
    alpaca.data_ws.onConnect(params.onConnect);
    alpaca.data_ws.onStateChange((newState: string) => {
        if (newState === "disconnected") {
            alpaca.data_ws.reconnect();
        }
    });
    alpaca.data_ws.connect();

    return alpaca.data_ws;
};

export const getCalendar = (start: Date, end: Date) => {
    return alpaca.getCalendar({
        start,
        end,
    });
};

export const closePosition = async (symbol: string) => {
    try {
        return alpaca.closePosition(symbol);
    } catch (e) {
        LOGGER.error(e);
    }
};

export const brokerImpl = {
    closePosition,
    createBracketOrder,
    getOpenPositions,
    getOpenOrders,
    cancelAlpacaOrder,
};
