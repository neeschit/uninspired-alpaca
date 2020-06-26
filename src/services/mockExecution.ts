import { Bar, TradeConfig, FilledTradeConfig, PlannedTradeConfig } from "../data/data.model";
import { formatInEasternTimeForDisplay } from "../util/date";
import {
    TimeInForce,
    Broker,
    AlpacaTradeConfig,
    AlpacaOrder,
    GetOrdersParams,
    AlpacaPosition,
    GetAssetsParams,
    Asset,
    Calendar,
    PositionDirection,
    TradeDirection,
    OrderStatus,
    TradeType,
} from "@neeschit/alpaca-trade-api";
import { alpaca } from "../resources/alpaca";
import { TradeManagement, isClosingOrder } from "./tradeManagement";
import { LOGGER } from "../instrumentation/log";
import { FilledPositionConfig } from "../resources/position";

let id = 0;

export const liquidatePosition = (
    position: FilledPositionConfig,
    bar: Bar
): FilledPositionConfig => {
    const symbol = position.symbol;

    const order = {
        filledQuantity: position.quantity,
        symbol: symbol,
        averagePrice: bar.c,
        status: OrderStatus.filled,
    };

    position.trades.push({
        /* order, */
        side: position.side === PositionDirection.long ? TradeDirection.sell : TradeDirection.buy,
        quantity: position.quantity,
        type: TradeType.market,
        price: 0,
        tif: TimeInForce.day,
        symbol,
        t: Date.now(),
        filledQuantity: order.filledQuantity,
        status: order.status,
        averagePrice: order.averagePrice,
    });

    position.quantity -= order.filledQuantity;

    return position;
};
export const executeSingleTrade = (
    exit: number,
    bar: Bar,
    tradePlan: TradeConfig,
    plannedEntryPrice: number,
    position: FilledPositionConfig | null
): FilledPositionConfig | null => {
    const symbol = tradePlan.symbol;
    const side =
        tradePlan.side === TradeDirection.buy ? PositionDirection.long : PositionDirection.short;

    // simulate tradePlan.price
    if (!bar) {
        return null;
    }

    tradePlan.estString = formatInEasternTimeForDisplay(tradePlan.t);

    if (!position) {
        let unfilledPosition = {
            symbol: symbol,
            originalQuantity: tradePlan.quantity,
            plannedEntryPrice,
            plannedStopPrice: exit,
            plannedQuantity: tradePlan.quantity,
            side: side,
            quantity: tradePlan.quantity,
            id: id++,
        };

        if (bar.h > tradePlan.stopPrice! && tradePlan.side === TradeDirection.buy) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: plannedEntryPrice + 0.01,
                status: OrderStatus.filled,
            };

            return {
                ...unfilledPosition,
                averageEntryPrice: order.averagePrice,
                riskAtrRatio: 1,
                trades: [
                    {
                        ...tradePlan,
                        ...order,
                    },
                ],
            };
        } else if (bar.l < tradePlan.stopPrice! && tradePlan.side === TradeDirection.sell) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: plannedEntryPrice - 0.01,
                status: OrderStatus.filled,
            };

            return {
                ...unfilledPosition,
                averageEntryPrice: order.averagePrice,
                riskAtrRatio: 1,
                trades: [
                    {
                        ...tradePlan,
                        ...order,
                    },
                ],
            };
        }

        return null;
    }

    if (tradePlan.type === TradeType.market) {
        return executeMarketOrder(tradePlan, symbol, bar, position);
    } else if (tradePlan.type === TradeType.limit) {
        if (bar.h > tradePlan.price || bar.l < tradePlan.price) {
            const order = {
                filledQuantity: tradePlan.quantity,
                symbol: symbol,
                averagePrice: tradePlan.price,
                status: OrderStatus.filled,
            };

            position.trades.push({
                /* order, */
                ...tradePlan,
                filledQuantity: order.filledQuantity,
                status: order.status,
                averagePrice: order.averagePrice,
            });
            position.quantity -= order.filledQuantity;

            return position;
        }
    }
    return null;
};

export const mapPendingOrder = (c: PlannedTradeConfig) => {
    return {
        id: "null",
        client_order_id: "null",
        created_at: new Date(),
        updated_at: new Date(),
        submitted_at: new Date(),
        filled_at: new Date(),
        expired_at: new Date(),
        canceled_at: new Date(),
        failed_at: new Date(),
        asset_id: "test",
        symbol: c.plan.symbol,
        asset_class: "stock",
        qty: c.plan.quantity,
        filled_qty: 0,
        type: c.config.type,
        side: c.config.side,
        time_in_force: c.config.tif,
        limit_price: c.config.price,
        stop_price: c.config.stopPrice || c.config.price,
        filled_avg_price: 0,
        status: OrderStatus.new,
        extended_hours: false,
    };
};

export class MockBroker implements Broker {
    private static instance: MockBroker;

    pastTradeConfigs: FilledTradeConfig[] = [];
    pendingTradeConfigs: PlannedTradeConfig[] = [];
    currentPositionConfigs: FilledPositionConfig[] = [];
    pastPositionConfigs: FilledPositionConfig[] = [];

    private constructor() {}

    reset() {
        this.pastTradeConfigs = [];
        this.pendingTradeConfigs = [];
        this.currentPositionConfigs = [];
        this.pastPositionConfigs = [];
    }

    cancelOrder(symbol: string): Promise<{}> {
        this.pendingTradeConfigs = this.pendingTradeConfigs.filter(
            (c) => c.config.symbol === symbol
        );

        return Promise.resolve({});
    }

    replaceOrder(oid: string): Promise<AlpacaOrder> {
        throw new Error("Method not implemented.");
    }

    getOrderByClientId(oid: string): Promise<AlpacaOrder> {
        throw new Error("Method not implemented.");
    }

    async createOrder(p: AlpacaTradeConfig): Promise<AlpacaOrder> {
        return (p as any) as AlpacaOrder;
    }
    async cancelAllOrders(): Promise<{}> {
        this.pendingTradeConfigs = [];

        return true;
    }
    async getOrders(params: GetOrdersParams): Promise<AlpacaOrder[]> {
        return this.pendingTradeConfigs.map((c) => mapPendingOrder(c));
    }
    async getPositions(): Promise<AlpacaPosition[]> {
        return this.currentPositionConfigs.map((p) => ({
            asset_id: "string",
            symbol: p.symbol,
            exchange: "string",
            asset_class: "string",
            avg_entry_price: p.averageEntryPrice + "",
            qty: p.quantity + "",
            side: p.side,
            market_value: "string",
            cost_basis: "string",
            unrealized_pl: "string",
            unrealized_plpc: "string",
            unrealized_intraday_pl: "string",
            unrealized_intraday_plpc: "string",
            current_price: "string",
            lastday_price: "string",
            change_today: "string",
        }));
    }
    async getPosition(symbol: string): Promise<AlpacaPosition> {
        throw new Error("Method not implemented.");
    }
    async closePosition(symbol: string): Promise<{}> {
        throw new Error("Method not implemented.");
    }
    async getAssets(params: GetAssetsParams): Promise<Asset[]> {
        throw new Error("Method not implemented.");
    }
    async getCalendar({ start, end }: { start: Date; end: Date }): Promise<Calendar[]> {
        return alpaca.getCalendar({ start, end });
    }
    setPositions(positions: any) {
        this.currentPositionConfigs = positions;
    }
    getPastPositions(): FilledPositionConfig[] {
        return this.pastPositionConfigs;
    }
    getCurrentPositions(): FilledPositionConfig[] {
        return this.currentPositionConfigs;
    }

    executeTrade(bar: Bar, trade: PlannedTradeConfig): FilledPositionConfig | null {
        const symbol = trade.plan.symbol;

        const position = executeSingleTrade(
            trade.plan.plannedStopPrice,
            bar,
            trade.config,
            trade.plan.plannedEntryPrice,
            null
        );

        if (position) {
            this.currentPositionConfigs.push(position);
            this.pendingTradeConfigs = this.pendingTradeConfigs.filter(
                (c) => c.plan.symbol !== symbol
            );
            this.pastTradeConfigs.push({
                ...trade.config,
                filledQuantity: position.trades[position.trades.length - 1].quantity,
                averagePrice: position.trades[position.trades.length - 1].price,
                status: position.trades[position.trades.length - 1].status,
                estString: formatInEasternTimeForDisplay(trade.config.t),
            });

            return position;
        }
        return null;
    }

    async rebalanceHeldPosition(
        manager: TradeManagement,
        bar: Bar | null,
        tradeConfig: TradeConfig,
        date?: Date
    ) {
        if (!bar) {
            LOGGER.error(
                `Couldn't find bar when trying to rebalance on ${date?.toLocaleString()} for ${
                    manager.plan.symbol
                }`
            );

            return null;
        }

        if (!manager || !manager.filledPosition || !manager.filledPosition.quantity) {
            return null;
        }

        if (!tradeConfig) {
            return null;
        }

        let executedClose = executeSingleTrade(
            manager.plan.plannedStopPrice,
            bar,
            tradeConfig,
            manager.plan.plannedEntryPrice,
            manager.filledPosition
        );

        if (!executedClose) {
            return null;
        }

        this.pastTradeConfigs.push({
            ...tradeConfig,
            averagePrice: executedClose.trades[executedClose.trades.length - 1].averagePrice,
            filledQuantity: executedClose.trades[executedClose.trades.length - 1].quantity,
            status: executedClose.trades[executedClose.trades.length - 1].status,
        });

        const isClosing = isClosingOrder(manager.filledPosition, tradeConfig);

        if (!isClosing) {
            return executedClose;
        }

        const closesEntirePosition = manager.filledPosition.quantity === 0;

        if (closesEntirePosition) {
            this.pastPositionConfigs.push(executedClose);

            this.currentPositionConfigs = this.currentPositionConfigs.filter(
                (p) => p.symbol !== tradeConfig.symbol
            );
        }

        return executedClose;
    }

    static getInstance() {
        if (!MockBroker.instance) {
            MockBroker.instance = new MockBroker();
        }

        return MockBroker.instance;
    }
}
function executeMarketOrder(
    tradePlan: TradeConfig,
    symbol: string,
    bar: Bar,
    position: FilledPositionConfig
) {
    const order = {
        filledQuantity: tradePlan.quantity,
        symbol: symbol,
        averagePrice: bar.c,
        status: OrderStatus.filled,
    };

    if (position.side === PositionDirection.long && position.plannedStopPrice < bar.l) {
        position.trades.push({
            /* order, */
            ...tradePlan,
            filledQuantity: order.filledQuantity,
            status: order.status,
            averagePrice: bar.h,
        });
        position.quantity -= order.filledQuantity;
        return position;
    } else if (position.side === PositionDirection.short && position.plannedStopPrice > bar.h) {
        position.trades.push({
            /* order, */
            ...tradePlan,
            filledQuantity: order.filledQuantity,
            status: order.status,
            averagePrice: bar.l,
        });
        position.quantity -= order.filledQuantity;
        return position;
    }

    const averagePrice =
        position.side === PositionDirection.short
            ? Math.min(bar.h, position.plannedStopPrice + position.plannedEntryPrice / 100)
            : Math.max(bar.l, position.plannedStopPrice - position.plannedEntryPrice / 100);

    LOGGER.info(averagePrice);

    position.trades.push({
        ...tradePlan,
        filledQuantity: order.filledQuantity,
        status: order.status,
        averagePrice,
    });
    position.quantity -= order.filledQuantity;
    return position;
}
