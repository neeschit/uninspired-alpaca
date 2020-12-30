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
import { formatISO, fromUnixTime, min } from "date-fns";
import { getSimpleData } from "../core-utils/resources/stockData";
import { Bar } from "../core-utils/data/data.model";
import { LOGGER } from "../core-utils/instrumentation/log";
import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";
import { formatInEasternTimeForDisplay } from "../core-utils/util/date";

export interface ClosedMockPosition {
    averageExitPrice: number;
    averageEntryPrice: number;
    plannedEntryPrice: number;
    plannedExitPrice: number;
    plannedTargetPrice: number;
    qty: number;
    side: PositionDirection;
    symbol: string;
    entryTime: string;
    exitTime: string;
    orderIds: {
        open: string;
        close: string;
    };
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

export class MockBrokerage implements BrokerStrategy {
    public stopLegs: AlpacaOrder[] = [];
    public profitLegs: AlpacaOrder[] = [];
    public closedPositions: ClosedMockPosition[] = [];
    public closedOrders: MockAlpacaOrder[] = [];
    private orders: MockAlpacaOrder[] = [];
    private openPositions: MockAlpacaPosition[] = [];
    private static instance: MockBrokerage;
    private epoch = Date.now();

    private constructor() {}

    public reset() {
        this.resetForSimulator();
        this.closedOrders = [];
        this.closedPositions = [];
    }

    public resetForSimulator() {
        this.orders = [];
        this.stopLegs = [];
        this.profitLegs = [];
        this.openPositions = [];
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

    public async closePosition(symbol: string) {
        return {};
    }

    public async tick(epoch: number) {
        this.epoch = epoch;

        const promises = this.orders.map(async (order) => {
            try {
                const symbol = order.symbol;
                const minuteBar = await getSimpleData(
                    symbol,
                    epoch,
                    true,
                    epoch + 1000
                );

                if (!minuteBar || !minuteBar.length) {
                    throw new Error(
                        `expected a bar at ${formatInEasternTimeForDisplay(
                            epoch
                        )}`
                    );
                }

                const isCurrentPosition = this.openPositions.some(
                    (p) => p.symbol === order.symbol
                );

                const isOrderFillable = this.checkIfOrderIsFillable(
                    order,
                    minuteBar[0],
                    isCurrentPosition
                );

                if (isCurrentPosition && !isOrderFillable) {
                    const stopOrderIndex = this.stopLegs.findIndex(
                        (o) => o.id === order.associatedOrderIds.stopLoss
                    );

                    if (stopOrderIndex >= 0) {
                        const stopOrder = this.stopLegs[stopOrderIndex];

                        const orderFilled = this.checkIfOrderIsFillable(
                            stopOrder!,
                            minuteBar[0],
                            isCurrentPosition
                        );
                    } else {
                        const hasClosed = this.openPositions.every(
                            (p) => p.symbol !== order.symbol
                        );

                        if (!hasClosed) {
                            throw new Error(
                                `Couldn't find a stop order when it was expected for ${JSON.stringify(
                                    order
                                )}`
                            );
                        }
                    }
                }
            } catch (e) {
                LOGGER.error(
                    `Unexpected error at ${formatISO(
                        epoch
                    )} for order ${JSON.stringify(order)}`,
                    e
                );
            }
        });

        await Promise.all(promises);
    }

    public checkIfOrderIsFillable(
        order: AlpacaOrder,
        minuteBar: Bar,
        isCurrentPosition: boolean
    ) {
        const isShort =
            !isCurrentPosition && order.side === TradeDirection.sell;

        const tradeType = order.type;

        const strikePrice =
            tradeType === TradeType.limit
                ? order.limit_price!
                : order.stop_price!;

        const filledAtTime = fromUnixTime(minuteBar.t / 1000).toISOString();

        const filled = isOrderFillable(
            isCurrentPosition,
            isShort,
            minuteBar,
            order,
            this.openPositions,
            strikePrice
        );

        if (filled) {
            if (!isCurrentPosition) {
                // fill order

                let index = this.orders.findIndex((o) => o.id === order.id);

                if (index < 0) {
                    throw new Error("this cannot be");
                }

                const mockOrder = this.orders.splice(index, 1)[0];

                mockOrder.filled_at = filledAtTime;
                mockOrder.filled_qty = order.qty;
                mockOrder.filled_avg_price = strikePrice;

                this.closedOrders.push(mockOrder);
                const takeProfitOrderIndex = this.profitLegs.findIndex(
                    (o) => o.symbol === order.symbol
                );
                const takeProfitOrder = this.profitLegs.splice(
                    takeProfitOrderIndex,
                    1
                )[0];
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

                if (positionIndex < 0) {
                    throw new Error("this cannot be");
                }

                const position = this.openPositions.splice(positionIndex, 1)[0];
                const originalOrder = this.closedOrders.find(
                    (o) => o.id === position.orderIds.original
                );

                const closingOrder = order;

                closingOrder!.filled_at = filledAtTime;
                closingOrder!.filled_qty = order.qty;
                closingOrder!.filled_avg_price = strikePrice;

                this.closedOrders.push({
                    ...order,
                    associatedOrderIds: {
                        takeProfit: originalOrder!.associatedOrderIds
                            .takeProfit,
                        stopLoss: originalOrder!.associatedOrderIds.stopLoss,
                    },
                });

                const stopOrderIndex = this.stopLegs.findIndex(
                    (o) => o.id === originalOrder!.associatedOrderIds.stopLoss
                );

                const stopOrder =
                    stopOrderIndex > -1
                        ? this.stopLegs.splice(stopOrderIndex, 1)[0]
                        : closingOrder;

                const takeProfitOrderIndex = this.orders.findIndex(
                    (o) => o.id === originalOrder!.associatedOrderIds.takeProfit
                );

                const takeProfitOrder =
                    takeProfitOrderIndex > -1
                        ? this.orders.splice(takeProfitOrderIndex, 1)[0]
                        : closingOrder;

                this.closedPositions.push({
                    symbol: order.symbol,
                    averageEntryPrice: originalOrder!.filled_avg_price,
                    averageExitPrice: closingOrder!.filled_avg_price,
                    plannedEntryPrice:
                        originalOrder!.stop_price ||
                        originalOrder!.limit_price!,
                    plannedExitPrice:
                        stopOrder?.stop_price || closingOrder!.stop_price!,
                    plannedTargetPrice:
                        takeProfitOrder?.limit_price ||
                        closingOrder!.limit_price!,
                    qty: originalOrder!.filled_qty,
                    side:
                        originalOrder!.side === TradeDirection.sell
                            ? PositionDirection.short
                            : PositionDirection.long,
                    entryTime: originalOrder!.filled_at as string,
                    exitTime: closingOrder!.filled_at as string,
                    orderIds: {
                        open: originalOrder!.id,
                        close: closingOrder!.id,
                    },
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

export const isOrderFillable = (
    isCurrentPosition: boolean,
    isShort: boolean,
    bar: Bar,
    order: AlpacaOrder,
    openPositions: AlpacaPosition[],
    strikePrice: number
) => {
    let filled = false;

    console.log({
        isCurrentPosition,
        isShort,
        bar,
        strikePrice,
        order: JSON.stringify(order),
        openPositions: JSON.stringify(openPositions),
    });

    if (!isCurrentPosition) {
        if (isShort && bar.o < strikePrice && bar.l < bar.o) {
            return false;
        } else if (!isShort && bar.o > strikePrice && bar.h > bar.o) {
            return false;
        }

        filled = isShort
            ? bar.l < bar.o && bar.l <= strikePrice
            : bar.h > bar.o && bar.h >= strikePrice;
    } else {
        const position = openPositions.find((p) => p.symbol === order.symbol);

        filled =
            position!.side === PositionDirection.long &&
            TradeType.limit === order.type
                ? bar.h >= strikePrice
                : PositionDirection.long === position!.side &&
                  TradeType.stop === order.type
                ? bar.l <= strikePrice
                : filled;

        filled =
            position!.side === PositionDirection.short &&
            TradeType.limit === order.type
                ? bar.l <= strikePrice
                : PositionDirection.short === position!.side &&
                  TradeType.stop === order.type
                ? bar.h >= strikePrice
                : filled;
    }

    return filled;
};

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
    const currentDate = fromUnixTime(epoch / 1000).toISOString();

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
        side: isShort ? PositionDirection.short : PositionDirection.long,
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
