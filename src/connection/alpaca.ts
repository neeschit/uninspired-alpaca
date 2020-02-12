import Alpaca from "@alpacahq/alpaca-trade-api";
import { load } from "dotenv";

const config = load().parsed;

export const alpaca = new Alpaca({
    keyId: config!.ALPACA_SECRET_KEY_ID,
    secretKey: config!.ALPACA_SECRET_KEY,
    paper: true
});
