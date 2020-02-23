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
    order_class: "simple" | "bracket";
}

export interface AlpacaOrderUpdate {
    id: string;
    client_order_id: string;
    created_at: string | Date;
    updated_at: string | Date;
    submitted_at: string | Date;
    filled_at: string | Date;
    expired_at: string | Date;
    canceled_at: string | Date;
    failed_at: string | Date;
    asset_id: string;
    symbol: string;
    asset_class: string;
    qty: number;
    filled_qty: number;
    type: TradeType;
    side: TradeDirection;
    time_in_force: TimeInForce;
    limit_price: number;
    stop_price: number;
    filled_avg_price: number;
    status: string;
    extended_hours: boolean;
}

export const alpaca = new Alpaca({
    keyId: config!.ALPACA_SECRET_KEY_ID,
    secretKey: config!.ALPACA_SECRET_KEY,
    paper: true
});
