declare module "@alpacahq/alpaca-trade-api" {
    export interface AlpacaParams {
        keyId: string;
        secretKey: string;
        paper: boolean;
    }
    export interface GetAssetsParams {
        status: string;
    }

    export interface Asset {
        symbol: string;
    }

    export enum TradeDirection {
        buy = "buy",
        sell = "sell"
    }

    export enum PositionDirection {
        long = "long",
        short = "short"
    }

    export enum TradeType {
        market = "market",
        limit = "limit",
        stop = "stop",
        stop_limit = "stop_limit"
    }

    export enum TimeInForce {
        day = "day",
        gtc = "gtc",
        opg = "opg",
        cls = "cls",
        ioc = "ioc",
        fok = "fok"
    }
    export enum OrderStatus {
        new = "new",
        partial_fill = "partially_filled",
        filled = "filled",
        canceled = "canceled",
        expired = "expired",
        pending_cancel = "pending_cancel",
        pending_replace = "pending_replace",
        done_for_day = "done_for_day"
    }

    export interface AlpacaOrder {
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
        status: OrderStatus;
        extended_hours: boolean;
    }
    export interface AlpacaTradeConfig {
        symbol: string;
        qty: number;
        side: TradeDirection;
        type: TradeType;
        time_in_force: TimeInForce;
        limit_price?: number;
        stop_price?: number;
        extended_hours: boolean;
        order_class: "simple" | "bracket";
    }

    export interface AlpacaPosition {
        asset_id: string;
        symbol: string;
        exchange: string;
        asset_class: string;
        avg_entry_price: string;
        qty: string;
        side: PositionDirection;
        market_value: string;
        cost_basis: string;
        unrealized_pl: string;
        unrealized_plpc: string;
        unrealized_intraday_pl: string;
        unrealized_intraday_plpc: string;
        current_price: string;
        lastday_price: string;
        change_today: string;
    }

    export type AlpacaOrderStatusFilter = "open" | "closed" | "all";

    export type SortDirection = "asc" | "desc";

    export interface GetOrdersParams {
        status: AlpacaOrderStatusFilter;
        after: Date;
        until: Date;
        limit: number;
        direction: SortDirection;
    }

    export interface Calendar {
        open: string;
        close: string;
        date: string;
    }

    class Alpaca {
        createOrder(params: AlpacaTradeConfig): Promise<AlpacaOrder>;
        cancelAllOrders(): Promise<{}>;
        getOrders(params: GetOrdersParams): Promise<AlpacaOrder[]>;
        getPositions(): Promise<AlpacaPosition[]>;
        getPosition(symbol: string): Promise<AlpacaPosition>;
        closePosition(symbol: string): Promise<{}>;
        getAssets(params: GetAssetsParams): Asset[];
        getCalendar({ start, end }: { start: Date; end: Date }): Promise<Calendar[]>;
        constructor(params: AlpacaParams);
    }

    export default Alpaca;
}
