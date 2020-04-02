import Alpaca from "@alpacahq/alpaca-trade-api";
import * as dotenv from "dotenv";

const config = dotenv.config().parsed;

const API_KEY = (config && config.LIVE_SECRET_KEY_ID) || process.env.LIVE_SECRET_KEY_ID || "";

const SECRET_KEY = (config && config.LIVE_SECRET_KEY) || process.env.LIVE_SECRET_KEY || "";

export const alpaca = new Alpaca({
    keyId: API_KEY,
    secretKey: SECRET_KEY,
    paper: false
});
