import Alpaca from "@alpacahq/alpaca-trade-api";
import * as dotenv from "dotenv";
import { TradeDirection, TradeType, TimeInForce } from "../data/data.model";

const config = dotenv.config().parsed;

export interface AlpacaTradeConfig {
    symbol: string;
    qty: number;
    side: TradeDirection;
    type: TradeType;
    time_in_force: TimeInForce;
    limit_price: number;
    stop_price: number;
    extended_hours: boolean;
    order_class: 'simple' | 'bracket';
}

export const alpaca = new Alpaca({
    keyId: config!.ALPACA_SECRET_KEY_ID,
    secretKey: config!.ALPACA_SECRET_KEY,
    paper: true
});
