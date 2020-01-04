import Alpaca from "@alpacahq/alpaca-trade-api";
import dotenv from "dotenv";

const config = dotenv.config().parsed;

console.log(config);

export const alpaca = new Alpaca({
  keyId: config.ALPACA_SECRET_KEY_ID,
  secretKey: config.ALPACA_SECRET_KEY,
  paper: true
});
