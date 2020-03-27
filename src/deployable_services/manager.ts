import { isMarketOpen } from "../util/market";
import {
    TradeConfig,
    TradePlan,
    DefaultDuration,
    PeriodType,
    OrderStatus
} from "../data/data.model";
import { readFileSync } from "fs";
import { alpaca } from "../connection/alpaca";
import { getSymbolDataGenerator } from "../connection/polygon";
import { addDays, format } from "date-fns";
import { LOGGER } from "../instrumentation/log";
import { getPlannedLogs } from "../util/getTradeLogFileName";
import { TradeManagement } from "../services/tradeManagement";

const plannedLogName = getPlannedLogs();

async function manage() {
    if (isMarketOpen() || !isMarketOpen()) {
        const tradingPlans: {
            config: TradeConfig;
            plan: TradePlan;
        }[] = JSON.parse(readFileSync(plannedLogName).toString());

        let positions = await alpaca.getPositions();

        if (positions.length) {
            const intervalFn = async () => {
                const updateGenerator = getSymbolDataGenerator(
                    positions.map(o => o.symbol),
                    DefaultDuration.one,
                    PeriodType.minute,
                    addDays(Date.now(), -1),
                    addDays(Date.now(), 1)
                );

                let orderProcessed = false;

                for await (const { bars, symbol } of updateGenerator()) {
                    const lastBar = bars[bars.length - 1];

                    if (Date.now() - lastBar.t > 300000) {
                        LOGGER.error(
                            `bad things happening for symbol ${symbol} at ${Date.now()} for ${
                                lastBar.t
                            }`
                        );
                        continue;
                    }

                    const position = positions.find(p => p.symbol === symbol);

                    if (!position) {
                        LOGGER.error("more bad things happening");
                        continue;
                    }

                    const plan = tradingPlans.find(p => p.plan.symbol === position.symbol);

                    if (!plan) {
                        LOGGER.error("seriously bad things happening");
                        continue;
                    }

                    const manager = new TradeManagement(plan.config, plan.plan);

                    manager.trades.push({
                        averagePrice: Number(position.avg_entry_price),
                        symbol,
                        filledQuantity: Math.abs(Number(position.qty)),
                        status: OrderStatus.filled,
                        ...plan.config
                    });

                    manager.position.originalQuantity = plan.plan.plannedQuantity;
                    manager.position.quantity = Math.abs(Number(position.qty));
                    manager.position.side = position.side;

                    const order = await manager.onTradeUpdate(lastBar);

                    LOGGER.info(order);

                    if (order) {
                        orderProcessed = true;
                    }

                    if (!isMarketOpen()) {
                        clearInterval(interval);
                    }
                }

                if (orderProcessed) {
                    positions = await alpaca.getPositions();
                }
            };
            const interval = setInterval(intervalFn, 60000);

            intervalFn();
        }
    }
}

manage()
    .then(() => LOGGER.info("done"))
    .catch(LOGGER.error);
