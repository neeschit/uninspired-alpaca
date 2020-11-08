import Alpaca, {
    AlpacaOrder,
    AlpacaTradeConfig,
} from "@neeschit/alpaca-trade-api";
import * as dotenv from "dotenv";

const config = dotenv.config().parsed;

const API_KEY = process.env.ALPACA_SECRET_KEY_ID;

const SECRET_KEY = process.env.ALPACA_SECRET_KEY;

export const alpaca = Alpaca({
    keyId: API_KEY!,
    secretKey: SECRET_KEY!,
    paper: true,
    usePolygon: true,
});

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
