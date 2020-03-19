import { LOGGER } from "../instrumentation/log";
import { readFileSync, createWriteStream, fstat, existsSync } from "fs";
import { getSymbolDataGenerator } from "../connection/polygon";
import { DefaultDuration, PeriodType, TradeConfig, PositionDirection } from "../data/data.model";
import { addDays, set, format } from "date-fns";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { alpaca } from "../connection/alpaca";
import { TradeManagement } from "../services/tradeManagement";
import { convertToLocalTime } from "../util/date";
import { isMarketOpen } from "../util/market";

const LARGE_CAPS = JSON.parse(readFileSync("./largecaps.json").toString());

async function main() {
    const ordersToBeManaged: TradeManagement[] = [];
    const plannedLogName = "./tradePlans" + format(Date.now(), "yyyy-MM-dd") + ".log";
    if (!existsSync(plannedLogName)) {
        const planStream = createWriteStream(plannedLogName);
        const narrowRangeInstances: NarrowRangeBarStrategy[] = [];
        const dailyBarGenerator = getSymbolDataGenerator(
            LARGE_CAPS,
            DefaultDuration.one,
            PeriodType.day,
            addDays(Date.now(), -75),
            new Date()
        );

        for await (const { bars, symbol } of dailyBarGenerator()) {
            try {
                const nrb = new NarrowRangeBarStrategy({
                    period: 7,
                    bars,
                    symbol
                });

                if (nrb.checkIfFitsStrategy()) {
                    narrowRangeInstances.push(nrb);
                }
            } catch (e) {
                LOGGER.error(e);
            }
        }

        LOGGER.info(narrowRangeInstances.map(n => n.symbol));

        const entryTime = convertToLocalTime(Date.now(), " 09:35:01.000");

        for (const n of narrowRangeInstances) {
            try {
                const order: TradeConfig | null = await n.rebalance();

                if (!order) {
                    LOGGER.warn(`Expected an order for ${n.symbol}`);
                } else {
                    const manager = new TradeManagement(order, {
                        symbol: n.symbol,
                        side: n.isShort ? PositionDirection.short : PositionDirection.long,
                        plannedEntryPrice: order.price,
                        plannedStopPrice: n.stopPrice,
                        plannedQuantity: order.quantity,
                        quantity: order.quantity
                    });

                    planStream.write(JSON.stringify([manager.plan, manager.config]) + "\n");

                    /* await manager.executeAndRecord(); */

                    ordersToBeManaged.push(manager);
                }
            } catch (e) {
                LOGGER.error(e);
            }
        }

        planStream.close();
    }

    if (isMarketOpen()) {
        const interval = setInterval(async () => {
            const updateGenerator = getSymbolDataGenerator(
                ordersToBeManaged.map(o => o.position.symbol),
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

                const manager = ordersToBeManaged.find(o => o.position.symbol === symbol);

                if (!manager) {
                    LOGGER.error("more bad things happening");
                    continue;
                }

                LOGGER.info(manager.plan);

                manager.onTradeUpdate(lastBar);

                if (!isMarketOpen()) {
                    clearInterval(interval);
                }
            }
        }, 60000);
    }
}

main()
    .then(() => LOGGER.info("done"))
    .catch(LOGGER.error);
