import Alpaca, { OrderStatus } from "@neeschit/alpaca-trade-api";
import * as dotenv from "dotenv";
import { open } from "fs";

const config = dotenv.config().parsed;

const API_KEY = (config && config.ALPACA_SECRET_KEY_ID) || process.env.ALPACA_SECRET_KEY_ID || "";

const SECRET_KEY = (config && config.ALPACA_SECRET_KEY) || process.env.ALPACA_SECRET_KEY || "";

export const alpaca = Alpaca({
    keyId: API_KEY,
    secretKey: SECRET_KEY,
    paper: true,
    usePolygon: true,
});

export const getOpenOrders = () => {
    return alpaca.getOrders({
        status: 'open'
    })
}
