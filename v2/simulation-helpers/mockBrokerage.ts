import {
    AlpacaOrder,
    AlpacaPosition,
    AlpacaTradeConfig,
    OrderStatus,
    TradeDirection,
    TradeType,
    PositionDirection,
} from "@neeschit/alpaca-trade-api";
import { v4 } from "uuid";
import { fromUnixTime } from "date-fns";
import { getSimpleData } from "../../src/resources/stockData";
import { Bar } from "../../src/data/data.model";

export interface ClosedMockPosition {
    avg_exit_price: number;
    avg_entry_price: number;
    qty: number;
    side: PositionDirection;
    symbol: string;
    entryTime: string;
    exitTime: string;
}

export interface MockAlpacaPosition extends AlpacaPosition {
    orderIds: {
        original: string;
        takeProfit: string;
        stopLoss: string;
    };
    id: string;
}

export interface MockAlpacaOrder extends AlpacaOrder {
    associatedOrderIds: {
        takeProfit: string;
        stopLoss: string;
    };
}

export class MockBrokerage {
    public stopLegs: AlpacaOrder[] = [];
    public profitLegs: AlpacaOrder[] = [];
    public closedPositions: ClosedMockPosition[] = [];
    private orders: MockAlpacaOrder[] = [];
    private openPositions: MockAlpacaPosition[] = [];
    private closedOrders: MockAlpacaOrder[] = [];
    private static instance: MockBrokerage;
    private epoch = Date.now();

    private constructor() {}

    public reset() {
        this.orders = [];
        this.stopLegs = [];
        this.profitLegs = [];
        this.openPositions = [];
        this.closedOrders = [];
        this.closedPositions = [];
    }

    public async cancelAlpacaOrder(oid: string): Promise<any> {}

    public async getOpenOrders(): Promise<AlpacaOrder[]> {
        return this.orders;
    }

    public async getOpenPositions(): Promise<AlpacaPosition[]> {
        return this.openPositions;
    }

    public async createBracketOrder(
        order: AlpacaTradeConfig
    ): Promise<AlpacaOrder> {
        if (!order.stop_loss) {
            throw new Error("stop_loss_missing_for_bracket_order");
        }
        if (!order.take_profit) {
            throw new Error("take_profit_missing_for_bracket_order");
        }

        const inverseOrderType =
            order.side === TradeDirection.sell
                ? TradeDirection.buy
                : TradeDirection.sell;

        const alpacaOrder = getFakeNewOrder(order, this.epoch);

        const stopOrder = getFakeNewOrder(
            {
                side: inverseOrderType,
                time_in_force: order.time_in_force,
                type: TradeType.stop,
                stop_price: order.stop_loss!.stop_price,
                symbol: order.symbol,
                qty: order.qty,
            },
            this.epoch
        );

        const takeProfitOrder = getFakeNewOrder(
            {
                side: inverseOrderType,
                time_in_force: order.time_in_force,
                type: TradeType.limit,
                limit_price: order.take_profit!.limit_price,
                symbol: order.symbol,
                qty: order.qty,
            },
            this.epoch
        );

        this.orders.push({
            ...alpacaOrder,
            associatedOrderIds: {
                takeProfit: takeProfitOrder.id,
                stopLoss: stopOrder.id,
            },
        });

        this.stopLegs.push(stopOrder);

        this.profitLegs.push(takeProfitOrder);

        return alpacaOrder;
    }

    public async closePosition(symbol: string) {}

    public async tick(epoch: number) {
        this.epoch = epoch;
        // check open orders

        for (const order of this.orders) {
            const symbol = order.symbol;
            const minuteBar = await getSimpleData(
                symbol,
                epoch,
                true,
                epoch + 1000
            );

            const isOrderFillable = this.checkIfOrderIsFillable(
                order,
                minuteBar[0]
            );
        }
    }

    public checkIfOrderIsFillable(order: AlpacaOrder, minuteBar: Bar) {
        const isCurrentPosition = this.openPositions.some(
            (p) => p.symbol === order.symbol
        );
        const isShort =
            !isCurrentPosition && order.side === TradeDirection.sell;

        const tradeType = order.type;

        const strikePrice =
            tradeType === TradeType.limit
                ? order.limit_price!
                : order.stop_price!;

        const index = this.orders.findIndex((o) => o.id === order.id);
        const filledAtTime = fromUnixTime(minuteBar.t).toISOString();

        const takeProfitOrderIndex = this.orders.findIndex(
            (o) => o.symbol === order.symbol
        );

        const filled = isShort
            ? minuteBar.l <= strikePrice
            : minuteBar.h >= strikePrice;

        if (filled) {
            // fill order
            const mockOrder = this.orders.splice(index, 1)[0];

            mockOrder.filled_at = filledAtTime;
            mockOrder.filled_qty = order.qty;

            this.closedOrders.push(mockOrder);

            const takeProfitOrder = this.profitLegs.splice(
                takeProfitOrderIndex,
                1
            )[0];

            if (!isCurrentPosition) {
                this.openPositions.push({
                    ...getFilledPosition(
                        order,
                        strikePrice,
                        isShort,
                        minuteBar
                    ),
                    orderIds: {
                        original: mockOrder.id,
                        ...mockOrder.associatedOrderIds,
                    },
                });

                this.orders.push({
                    ...takeProfitOrder,
                    associatedOrderIds: {
                        takeProfit: takeProfitOrder.id,
                        stopLoss: mockOrder.associatedOrderIds.stopLoss,
                    },
                });
            } else {
                const positionIndex = this.openPositions.findIndex(
                    (p) => p.symbol === order.symbol
                );

                const position = this.openPositions.splice(positionIndex, 1)[0];

                const originalOrder = this.closedOrders.find(
                    (o) => o.id === position.orderIds.original
                );

                const closingOrder = this.closedOrders.find(
                    (o) =>
                        o.id === position.orderIds.stopLoss ||
                        o.id === position.orderIds.takeProfit
                );

                this.closedPositions.push({
                    symbol: order.symbol,
                    avg_entry_price: originalOrder!.filled_avg_price,
                    avg_exit_price: closingOrder!.filled_avg_price,
                    qty: originalOrder!.filled_qty,
                    side: isShort
                        ? PositionDirection.short
                        : PositionDirection.long,
                    entryTime: originalOrder!.filled_at as string,
                    exitTime: closingOrder!.filled_at as string,
                });
            }
        }

        return filled;
    }

    public static getInstance() {
        if (!MockBrokerage.instance) {
            MockBrokerage.instance = new MockBrokerage();
        }

        return MockBrokerage.instance;
    }
}

const getFakeNewOrder = (
    order: Pick<
        AlpacaTradeConfig,
        | "client_order_id"
        | "symbol"
        | "type"
        | "side"
        | "qty"
        | "time_in_force"
        | "limit_price"
        | "stop_price"
    >,
    epoch: number
) => {
    const currentDate = fromUnixTime(epoch).toISOString();

    return {
        id: v4(),
        client_order_id: order.client_order_id,
        created_at: currentDate,
        updated_at: currentDate,
        submitted_at: currentDate,
        filled_at: currentDate,
        expired_at: currentDate,
        canceled_at: currentDate,
        failed_at: currentDate,
        asset_id: "",
        symbol: order.symbol,
        asset_class: "",
        qty: order.qty,
        filled_qty: 0,
        type: order.type,
        side: order.side,
        time_in_force: order.time_in_force,
        limit_price: order.limit_price,
        stop_price: order.stop_price,
        filled_avg_price: 0,
        status: OrderStatus.new,
        extended_hours: false,
    };
};

const getFilledPosition = (
    order: AlpacaOrder,
    strikePrice: number,
    isShort: boolean,
    lastBar: Bar
) => {
    return {
        id: v4(),
        side: PositionDirection.long,
        symbol: order.symbol,
        qty: order.qty + "",
        asset_class: "",
        asset_id: "",
        avg_entry_price: strikePrice + "",
        market_value: "",
        cost_basis: "",
        unrealized_intraday_pl: "",
        lastday_price: "",
        current_price: lastBar.c + "",
        exchange: "",
        unrealized_intraday_plpc: "",
        unrealized_pl: "",
        unrealized_plpc: "",
        change_today: "",
    };
};
