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

        const positions = await alpaca.getPositions();

        if (positions.length) {
            const interval = setInterval(async () => {
                const updateGenerator = getSymbolDataGenerator(
                    positions.map(o => o.symbol),
                    DefaultDuration.one,
                    PeriodType.minute,
                    addDays(Date.now(), -1),
                    addDays(Date.now(), 1)
                );

                for await (const { bars, symbol } of updateGenerator()) {
                    const lastBar = bars[bars.length - 1];

                    if (Date.now() - lastBar.t > 120000) {
                        LOGGER.error("bad things happening");
                        continue;
                    }

                    const position = positions.find(p => p.symbol === symbol);

                    if (!position) {
                        LOGGER.error("more bad things happening");
                        continue;
                    }

                    const plan = tradingPlans.find(
                        p => p.plan.symbol === position.symbol
                    );

                    if (!plan) {
                        LOGGER.error("seriously bad things happening");
                        continue;
                    }

                    const manager = new TradeManagement(plan.config, plan.plan);

                    manager.order = {
                        averagePrice: Number(position.avg_entry_price),
                        symbol,
                        filledQuantity: Math.abs(Number(position.qty)),
                        status: OrderStatus.filled
                    };

                    manager.position.originalQuantity =
                        manager.position.plannedQuantity;
                    manager.position.quantity = Math.abs(Number(position.qty));
                    manager.position.side = position.side;

                    const order = await manager.onTradeUpdate(lastBar);

                    console.log(order);

                    if (!isMarketOpen()) {
                        clearInterval(interval);
                    }
                }
            }, 60000);
        }
    }
}

manage()
    .then(() => LOGGER.info("done"))
    .catch(LOGGER.error);
