import Alpaca from "@alpacahq/alpaca-trade-api";
import * as dotenv from "dotenv";

const config = dotenv.config().parsed;

export const alpaca = new Alpaca({
    keyId: config!.ALPACA_SECRET_KEY_ID,
    secretKey: config!.ALPACA_SECRET_KEY,
    paper: true
});
