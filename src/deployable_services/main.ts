import { LOGGER } from "../instrumentation/log";
import { readFileSync, createWriteStream, fstat, existsSync } from "fs";
import { getSymbolDataGenerator } from "../resources/polygon";
import {
    DefaultDuration,
    PeriodType,
    TradeConfig,
    TradePlan,
    TradeDirection,
    PlannedTradeConfig
} from "../data/data.model";
import { addDays, format, set } from "date-fns";
import { NarrowRangeBarStrategy } from "../strategy/narrowRangeBar";
import { TradeManagement } from "../services/tradeManagement";
import { convertToLocalTime } from "../util/date";
import { alpaca } from "../resources/alpaca";
import { getPlannedLogs } from "../util/getTradeLogFileName";
import { getBarsByDate } from "../data/bars";
import { getHighVolumeCompanies } from "../data/filters";

const LARGE_CAPS = getHighVolumeCompanies();

function combLogFilesForPlans(symbols: string[]) {
    const activePlans = [];

    let index = -1;

    while (activePlans.length !== symbols.length) {
        const plannedLogName = getPlannedLogs(addDays(Date.now(), index));

        if (!existsSync(plannedLogName)) {
            LOGGER.error(`didn't find a log file but found active positions`);
            break;
        }

        const plans: { plan: TradePlan; config: TradeConfig }[] = JSON.parse(
            readFileSync(plannedLogName).toString()
        );

        const active = plans.filter(p => symbols.indexOf(p.plan.symbol) !== -1);

        activePlans.push(...active);

        index--;
    }

    return activePlans;
}

async function main() {
    const ordersToBeManaged: TradeManagement[] = [];
    const positions = await alpaca.getPositions();
    const symbols = positions.map(p => p.symbol);

    const activePlans = combLogFilesForPlans(symbols);

    const plannedLogName = getPlannedLogs();
    if (!existsSync(plannedLogName)) {
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
                    symbol,
                    useSimpleRange: false,
                    counterTrend: false,
                    broker: alpaca
                });

                if (nrb.checkIfFitsStrategy()) {
                    narrowRangeInstances.push(nrb);
                }
            } catch (e) {
                LOGGER.error(e);
            }
        }

        LOGGER.info(narrowRangeInstances.map(n => n.symbol));

        const entryTime = set(Date.now(), narrowRangeInstances[0].entryEpochTrigger);

        while (Date.now() < entryTime.getTime()) {
            /* LOGGER.warn(`tis not time`); */
        }

        const logs = [...activePlans];

        for (const n of narrowRangeInstances) {
            try {
                const lastBar = await getBarsByDate(
                    n.symbol,
                    addDays(Date.now(), -1),
                    addDays(Date.now(), 1)
                );
                if (!lastBar || !lastBar.length) {
                    LOGGER.warn(`Couldn't find the bars for ${n.symbol}`);
                    continue;
                }

                const timezonedStamp = convertToLocalTime(Date.now(), " 09:30:00.000");

                const bar = lastBar.find(bar => bar.t === timezonedStamp.getTime());

                if (!bar) {
                    LOGGER.warn(`Couldn't find the right bar for ${n.symbol}`);
                    continue;
                }

                const orders: PlannedTradeConfig[] | null = await n.rebalance(bar);

                if (!orders) {
                    LOGGER.warn(`Expected an order for ${n.symbol}`);
                } else {
                    for (const order of orders) {
                        const manager = new TradeManagement(
                            {
                                symbol: n.symbol,
                                ...order.config
                            },
                            order.plan,
                            1,
                            alpaca
                        );

                        logs.push({
                            plan: manager.plan,
                            config: manager.config
                        });

                        await manager.executeAndRecord();

                        ordersToBeManaged.push(manager);
                    }
                }
            } catch (e) {
                LOGGER.error(e);
            }
        }

        const planStream = createWriteStream(plannedLogName);
        planStream.write(JSON.stringify(logs));
        planStream.close();
    }
}

main()
    .then(() => LOGGER.info("done"))
    .catch(LOGGER.error);
