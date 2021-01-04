import { getConnection } from "../connection/pg";
import {
    TickBar,
    TradeUpdate,
    Bar,
    PeriodType,
    DefaultDuration,
} from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { set, addBusinessDays } from "date-fns";
import { getPolyonData } from "./polygon";
import { Client } from "pg";
import { getCreateTradePlanTableSql } from "../../trade-management-helpers/position";
import { getCreateUnfilledOrdersTableSql } from "../../trade-management-helpers/order";

export const createDbIfNotExists = async () => {
    const checkQuery = `select datname FROM pg_catalog.pg_database where lower(datname) = lower('stock_data');`;
    const pool = new Client({
        database: "postgres",
    });
    await pool.connect();
    const result = await pool.query(checkQuery);

    if (!result.rowCount) {
        try {
            await pool.query("create database stock_data;");
            LOGGER.info("successfully created database");
        } catch (e) {
            LOGGER.error(e);
        }
    }
    await pool.end();

    const connection = getConnection();

    await connection.query(
        "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
    );
};

const getAggregatedTickTableNameForSymbol = (symbol: string) =>
    `tick_${symbol.toLowerCase()}`;

const getCreateAggregatedBarsTableSql = (
    tablename: string
) => `create table ${tablename} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    vw numeric not null,
    v integer not null
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 month');
`;

const getDailyTableNameForSymbol = (symbol: string) =>
    `daily_${symbol.toLowerCase()}`;

const getCreateAggregatedDailyBarsTableSql = (
    tablename: string
) => `create table ${tablename} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    v integer not null
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 year');
`;

const getAggregatedMinuteTableNameForSymbol = (symbol: string) =>
    `minute_${symbol.toLowerCase()}`;

const getTradeTableNameForSymbol = (symbol: string) =>
    `trades_${symbol.toLowerCase()}`;

const getCreateTradesTableSql = (
    tablename: string
) => `create table ${tablename} (
    t timestamptz(3) not null,
    i bigint not null,
    x integer not null,
    p integer not null,
    s integer not null,
    z integer not null,
    c integer[]
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 day');
`;

const checkIfTableExists = async (tablename: string) => {
    const pool = getConnection();

    try {
        const result = await pool.query(
            `SELECT '${tablename.toLowerCase()}'::regclass;`
        );

        return result.rowCount > 0;
    } catch (e) {
        return false;
    }
};

export const checkIfTableExistsForSymbol = async (symbol: string) => {
    const tableName = getTradeTableNameForSymbol(symbol);
    const tickTableName = getDailyTableNameForSymbol(symbol);

    return (
        (await checkIfTableExists(tableName)) &&
        (await checkIfTableExists(tickTableName))
    );
};

export const createStorageTables = async (symbols: string[]) => {
    const pool = getConnection();

    const results = [];

    for (const symbol of symbols) {
        try {
            results.push(
                await createAggregatedSecondsDataTableForSymbol(symbol, pool)
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await createTradeDataTableForSymbol(symbol, pool));
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await createAggregatedMinutesDataTableForSymbol(symbol, pool)
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await createAggregatedDailyDataTableForSymbol(symbol, pool)
            );
        } catch (e) {
            LOGGER.error(e);
        }
    }

    return results;
};

export const dropStorageTables = async (symbols: string[]) => {
    const pool = getConnection();

    const results = [];

    for (const symbol of symbols) {
        try {
            results.push(
                await pool.query(
                    `drop table ${getAggregatedTickTableNameForSymbol(symbol)};`
                )
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await pool.query(
                    `drop table ${getAggregatedMinuteTableNameForSymbol(
                        symbol
                    )};`
                )
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await pool.query(
                    `drop table ${getTradeTableNameForSymbol(symbol)};`
                )
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await pool.query(
                    `drop table ${getDailyTableNameForSymbol(symbol)};`
                )
            );
        } catch (e) {
            LOGGER.error(e);
        }
    }

    return results;
};

export const createNewMetadataTables = async () => {
    const positionsExists = await checkIfTableExists("trade_plan");
    const ordersExists = await checkIfTableExists("new_order");

    if (!positionsExists) {
        await getConnection().query(getCreateTradePlanTableSql());
    }

    if (!ordersExists) {
        await getConnection().query(getCreateUnfilledOrdersTableSql());
    }
};

const getTimestampValue = (t: number) => {
    return `to_timestamp(${t}::double precision / 1000)`;
};

export const insertDailyBar = async (bar: TickBar, symbol: string) => {
    const pool = getConnection();

    const tablename = getDailyTableNameForSymbol(symbol);

    const query = `insert into ${tablename} values (
        ${getTimestampValue(bar.t)}, 
        ${bar.o}, 
        ${bar.h}, 
        ${bar.l}, 
        ${bar.c}, 
        ${bar.v}
    ) ON CONFLICT (t) DO UPDATE set 
        l = ${bar.l}, 
        h = ${bar.h}, 
        c = ${bar.c}, 
        o = ${bar.o}, 
        v = ${bar.v};`;

    LOGGER.trace(query);

    return pool.query(query);
};

export const batchInsertDailyBars = async (bars: TickBar[], symbol: string) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = getDailyTableNameForSymbol(symbol);

    const queries: string[] = [];

    for (const bar of bars) {
        const query = `insert into ${tablename} values (
            ${getTimestampValue(bar.t)}, 
            ${bar.o}, 
            ${bar.h}, 
            ${bar.l}, 
            ${bar.c}, 
            ${bar.v}
        ) ON CONFLICT (t) DO UPDATE set 
        l = ${bar.l}, 
        h = ${bar.h}, 
        c = ${bar.c}, 
        o = ${bar.o}, 
        v = ${bar.v};`;

        LOGGER.debug(query);

        queries.push(query);
    }
    LOGGER.debug(queries);

    try {
        return client.query(queries.join("\n"));
    } catch (e) {
        LOGGER.error(e);
    } finally {
        client.release();
    }
};

export const insertBar = async (
    bar: TickBar,
    symbol: string,
    isMinute = false
) => {
    const pool = getConnection();

    const tablename = isMinute
        ? getAggregatedMinuteTableNameForSymbol(symbol)
        : getAggregatedTickTableNameForSymbol(symbol);

    const query = `insert into ${tablename} values (
        ${getTimestampValue(bar.t)}, 
        ${bar.o}, 
        ${bar.h}, 
        ${bar.l}, 
        ${bar.c}, 
        ${bar.vw || 0}, 
        ${bar.v}
    ) ON CONFLICT (t) DO UPDATE set 
        l = ${bar.l}, 
        h = ${bar.h}, 
        c = ${bar.c}, 
        o = ${bar.o}, 
        vw = ${bar.vw || 0}, 
        v = ${bar.v};`;

    LOGGER.debug(query);

    return pool.query(query);
};

export const batchInsertBars = async (
    bars: TickBar[],
    symbol: string,
    isMinute = false
) => {
    const pool = getConnection();

    const tablename = isMinute
        ? getAggregatedMinuteTableNameForSymbol(symbol)
        : getAggregatedTickTableNameForSymbol(symbol);

    const queries: string[] = [];

    for (const bar of bars) {
        const query = `insert into ${tablename} values (
            ${getTimestampValue(bar.t)}, 
            ${bar.o}, 
            ${bar.h}, 
            ${bar.l}, 
            ${bar.c}, 
            ${bar.vw || 0}, 
            ${bar.v}
        ) ON CONFLICT (t) DO UPDATE set 
        l = ${bar.l}, 
        h = ${bar.h}, 
        c = ${bar.c}, 
        o = ${bar.o}, 
        vw = ${bar.vw || 0}, 
        v = ${bar.v};`;
        LOGGER.debug(query);
        queries.push(query);
    }

    return pool.query(queries.join("\n")).catch((e) => {
        LOGGER.error(queries);
        throw e;
    });
};

export const insertTrade = async (trades: TradeUpdate[]) => {
    const pool = getConnection();

    const queries: string[] = [];

    for (const trade of trades) {
        const tablename = getTradeTableNameForSymbol(trade.sym);

        const query = `insert into ${tablename} values (
                        to_timestamp(${trade.t}::double precision / 1000), 
                        ${trade.i}, 
                        ${trade.x}, 
                        ${trade.p}, 
                        ${trade.s}, 
                        ${trade.z}${trade.c ? "," : ""}
                        ${trade.c ? "'{" + trade.c.join(",") + "}'" : ""}
                    ) ON CONFLICT DO NOTHING;`;

        queries.push(query);
    }

    const query = queries.join("\n");

    try {
        await pool.query(query);
    } catch (e) {
        LOGGER.error(e);
        /* LOGGER.error(query); */
    }
};

export const createAggregatedSecondsDataTableForSymbol = (
    symbol: string,
    pool = getConnection()
) => {
    return pool.query(
        getCreateAggregatedBarsTableSql(
            getAggregatedTickTableNameForSymbol(symbol)
        )
    );
};

export const createAggregatedMinutesDataTableForSymbol = (
    symbol: string,
    pool = getConnection()
) => {
    return pool.query(
        getCreateAggregatedBarsTableSql(
            getAggregatedMinuteTableNameForSymbol(symbol)
        )
    );
};

export const createAggregatedDailyDataTableForSymbol = (
    symbol: string,
    pool = getConnection()
) => {
    return pool.query(
        getCreateAggregatedDailyBarsTableSql(getDailyTableNameForSymbol(symbol))
    );
};

export const createTradeDataTableForSymbol = (
    symbol: string,
    pool = getConnection()
) => {
    const query = getCreateTradesTableSql(getTradeTableNameForSymbol(symbol));
    return pool.query(query);
};

const getDataQuery = (
    tablename: string,
    fromTimestamp: number,
    timeBucket: string,
    endTimeStamp?: number
) => {
    return `
        select 
            time_bucket('${timeBucket}', t) as time_bucket, 
            sum(v) as v,
            min(l) as l,
            max(h) as h,
            last(c, t) as c,
            first(o, t) as o,
            count(*) as n
        from ${tablename.toLowerCase()} 
        ${fromTimestamp ? "where t >= " + getTimestampValue(fromTimestamp) : ""}
        ${
            endTimeStamp && fromTimestamp
                ? "and t < " + getTimestampValue(endTimeStamp)
                : endTimeStamp && !fromTimestamp
                ? "where t < " + getTimestampValue(endTimeStamp)
                : ""
        }
        group by time_bucket 
        order by time_bucket asc;
    `;
};

const getSimpleDataQuery = (
    tablename: string,
    fromTimestamp?: number,
    endTimeStamp?: number
) => {
    return `
        select 
            *
        from ${tablename.toLowerCase()}  
        ${fromTimestamp ? "where t >= " + getTimestampValue(fromTimestamp) : ""}
        ${fromTimestamp && endTimeStamp ? "and " : ""}
        ${!fromTimestamp && endTimeStamp ? "where " : ""}
        ${endTimeStamp ? " t < " + getTimestampValue(endTimeStamp) : ""}
        order by t asc;
    `;
};

export const getData = async (
    symbol: string,
    fromTimestamp: number,
    timeBucket = "5 minutes",
    endTimeStamp: number = Date.now()
): Promise<Bar[]> => {
    const pool = getConnection();

    const tableName = getAggregatedMinuteTableNameForSymbol(symbol);

    const query = getDataQuery(
        tableName,
        fromTimestamp,
        timeBucket,
        endTimeStamp
    );

    LOGGER.debug(query);

    try {
        const result = await pool.query(query);

        return result.rows.map((r) => {
            return {
                v: Number(r.v),
                c: Number(r.c),
                o: Number(r.o),
                h: Number(r.h),
                l: Number(r.l),
                t: new Date(r.time_bucket).getTime(),
                n: Number(r.n),
            };
        });
    } catch (e) {
        LOGGER.error(e);
        return [];
    }
};

export const getSimpleData = async (
    symbol: string,
    fromTimestamp: number,
    isMinute = false,
    endTimeStamp: number = Date.now()
) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tableName = isMinute
        ? getAggregatedMinuteTableNameForSymbol(symbol)
        : getDailyTableNameForSymbol(symbol);

    const query = getSimpleDataQuery(tableName, fromTimestamp, endTimeStamp);

    try {
        const result = await client.query(query);

        return result.rows.map((r) => {
            return {
                v: Number(r.v),
                c: Number(r.c),
                o: Number(r.o),
                h: Number(r.h),
                l: Number(r.l),
                t: new Date(r.t).getTime(),
            };
        });
    } catch (e) {
        LOGGER.error(e);
        return [];
    } finally {
        client.release();
    }
};

export const getLastPrice = async (
    symbol: string,
    endTimeStamp: number = Date.now()
) => {
    const pool = getConnection();

    const tableName = getAggregatedMinuteTableNameForSymbol(symbol);

    const query = `select * from ${tableName} where t <= ${getTimestampValue(
        endTimeStamp
    )} order by t desc limit 1;`;

    LOGGER.debug(query);

    const result = await pool.query(query);

    return result.rows.map((r) => {
        return {
            v: Number(r.v),
            c: Number(r.c),
            o: Number(r.o),
            h: Number(r.h),
            l: Number(r.l),
            t: new Date(r.t).getTime(),
        };
    })[0];
};

export const getTodaysData = (
    symbol: string,
    currentEpoch = Date.now(),
    startEpochOverride = currentEpoch,
    timeBucket = "5 minutes"
) => {
    const startEpoch = set(currentEpoch, {
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
        hours: 9,
    }).getTime();

    return getData(symbol, startEpoch, timeBucket, currentEpoch);
};

export const getTodaysDataSimple = (
    symbol: string,
    currentEpoch = Date.now()
) => {
    const startEpoch = set(currentEpoch, {
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
        hours: 9,
    }).getTime();

    return getSimpleData(symbol, startEpoch, true);
};

export const getYesterdaysEndingBars = async (
    symbol: string,
    currentEpoch = Date.now(),
    timeBucket = "5 minutes"
) => {
    const startEpoch = set(addBusinessDays(currentEpoch, -2), {
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
        hours: 9,
    });
    const endEpoch = set(addBusinessDays(currentEpoch, -1), {
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        hours: 16,
    });

    const tablename = getAggregatedMinuteTableNameForSymbol(symbol);

    const query = `
        select 
            time_bucket('${timeBucket}', t) as time_bucket, 
            sum(v) as v,
            min(l) as l,
            max(h) as h,
            last(c, t) as c,
            first(o, t) as o,
            count(*) as n 
        from ${tablename.toLowerCase()} 
        where t >= ${getTimestampValue(startEpoch.getTime())}
        and t < ${getTimestampValue(endEpoch.getTime())}
        group by time_bucket 
        order by time_bucket desc limit 10;
    `;

    LOGGER.debug(query);

    const pool = getConnection();

    const result = await pool.query(query);

    return result.rows.map((r) => {
        return {
            v: Number(r.v),
            c: Number(r.c),
            o: Number(r.o),
            h: Number(r.h),
            l: Number(r.l),
            t: new Date(r.time_bucket).getTime(),
        };
    });
};

export const cacheDailyBarsForSymbol = async (symbol: string) => {
    const daysMinutes = await getPolyonData(
        symbol,
        addBusinessDays(Date.now(), -15),
        addBusinessDays(Date.now(), 0),
        PeriodType.day,
        DefaultDuration.one
    );

    if (!daysMinutes[symbol] || !daysMinutes[symbol].length) {
        return;
    }

    try {
        await batchInsertDailyBars(daysMinutes[symbol], symbol);
    } catch (e) {
        LOGGER.error(`Error inserting for ${symbol}`, e);
    }
};

export const deleteBarsForSymbol = async (symbol: string) => {
    const connection = getConnection();

    const dailyQuery = `truncate ${getDailyTableNameForSymbol(symbol)}`;
    const minuteQuery = `truncate ${getAggregatedMinuteTableNameForSymbol(
        symbol
    )}`;

    await getConnection().query([dailyQuery, minuteQuery].join("\n"));
};

export const deleteDailyBars = async (symbols: string[], epoch: number) => {
    const queries: string[] = [];
    for (const symbol of symbols) {
        const tablename = getDailyTableNameForSymbol(symbol);
        const query = `delete from ${tablename} where t >= ${getTimestampValue(
            epoch
        )};`;
        queries.push(query);
    }

    await deleteBatch(queries.slice(0, 10).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(10, 20).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(20, 30).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(30, 40).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(40, 50).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(50, 60).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(60, 70).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(70, 80).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(80, 90).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(90, 100).join("\n"));
    LOGGER.info("no prob so far");
    await deleteBatch(queries.slice(100).join("\n"));
    LOGGER.info(queries);

    return queries;
};

export async function getPersistedData(
    symbol: string,
    startEpoch: number,
    epoch: number
) {
    const data = await getData(symbol, startEpoch, "5 minutes", epoch);

    const lastBar =
        Number(data[data.length - 1].n) < 5
            ? data.pop()!
            : data[data.length - 1];

    return { data, lastBar };
}
export const deleteBatch = async (queries: string) => {
    const pool = getConnection();

    await pool.query(queries);
};
