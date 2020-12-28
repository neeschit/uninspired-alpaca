import {
    AlpacaTradeConfig,
    AlpacaOrder,
    AlpacaPosition,
} from "@neeschit/alpaca-trade-api";

export interface BrokerStrategy {
    closePosition(symbol: string): Promise<any>;
    createBracketOrder(order: AlpacaTradeConfig): Promise<AlpacaOrder>;
    getOpenPositions(): Promise<AlpacaPosition[]>;
    getOpenOrders(): Promise<AlpacaOrder[]>;
    cancelAlpacaOrder(oid: string): Promise<any>;
}
