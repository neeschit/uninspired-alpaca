import { getConnection } from "../connection/pg";
import { TickBar, TradeUpdate, Bar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { getCreateOrdersTableSql } from "./order";
import { getCreatePositionsTableSql } from "./position";
const getAggregatedTickTableNameForSymbol = (symbol: string) => `tick_${symbol.toLowerCase()}`;

const getCreateAggregatedBarsTableSql = (tablename: string) => `create table ${tablename} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    vw numeric not null,
    v integer not null
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 day');
`;

const getDailyTableNameForSymbol = (symbol: string) => `daily_${symbol.toLowerCase()}`;

const getCreateAggregatedDailyBarsTableSql = (tablename: string) => `create table ${tablename} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    v integer not null
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 day');
`;

const getAggregatedMinuteTableNameForSymbol = (symbol: string) => `minute_${symbol.toLowerCase()}`;

const getTradeTableNameForSymbol = (symbol: string) => `trades_${symbol.toLowerCase()}`;

const getCreateTradesTableSql = (tablename: string) => `create table ${tablename} (
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
        const result = await pool.query(`SELECT '${tablename.toLowerCase()}'::regclass;`);

        return result.rowCount > 0;
    } catch (e) {
        return false;
    }
};

export const checkIfTableExistsForSymbol = async (symbol: string) => {
    const tableName = getTradeTableNameForSymbol(symbol);
    const tickTableName = getDailyTableNameForSymbol(symbol);

    return (await checkIfTableExists(tableName)) && (await checkIfTableExists(tickTableName));
};

export const createStorageTables = async (symbols: string[]) => {
    const pool = getConnection();

    const results = [];

    for (const symbol of symbols) {
        try {
            results.push(await createAggregatedSecondsDataTableForSymbol(symbol, pool));
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await createTradeDataTableForSymbol(symbol, pool));
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await createAggregatedMinutesDataTableForSymbol(symbol, pool));
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await createAggregatedDailyDataTableForSymbol(symbol, pool));
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
                await pool.query(`drop table ${getAggregatedTickTableNameForSymbol(symbol)};`)
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(
                await pool.query(`drop table ${getAggregatedMinuteTableNameForSymbol(symbol)};`)
            );
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await pool.query(`drop table ${getTradeTableNameForSymbol(symbol)};`));
        } catch (e) {
            LOGGER.error(e);
        }
    }

    return results;
};

export const createMetadataTables = async () => {
    const positionsExists = await checkIfTableExists("positions");
    const ordersExists = await checkIfTableExists("orders");

    if (!positionsExists) {
        await getConnection().query(getCreatePositionsTableSql());
    }

    if (!ordersExists) {
        await getConnection().query(getCreateOrdersTableSql());
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
    );`;

    LOGGER.debug(query);

    return pool.query(query);
};

export const insertBar = async (bar: TickBar, symbol: string, isMinute = false) => {
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
        ${bar.vw}, 
        ${bar.v}
    );`;

    LOGGER.debug(query);

    return pool.query(query);
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
                    );`;

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
    return pool.query(getCreateAggregatedBarsTableSql(getAggregatedTickTableNameForSymbol(symbol)));
};

export const createAggregatedMinutesDataTableForSymbol = (
    symbol: string,
    pool = getConnection()
) => {
    return pool.query(
        getCreateAggregatedBarsTableSql(getAggregatedMinuteTableNameForSymbol(symbol))
    );
};

export const createAggregatedDailyDataTableForSymbol = (symbol: string, pool = getConnection()) => {
    return pool.query(getCreateAggregatedDailyBarsTableSql(getDailyTableNameForSymbol(symbol)));
};

export const createTradeDataTableForSymbol = (symbol: string, pool = getConnection()) => {
    const query = getCreateTradesTableSql(getTradeTableNameForSymbol(symbol));
    return pool.query(query);
};

const getDataQuery = (tablename: string, fromTimestamp?: number, timeBucket = "5 minutes") => {
    return `
        select 
            time_bucket('${timeBucket}', t) as time_bucket, 
            sum(v) as v,
            min(l) as l,
            max(h) as h,
            last(c, t) as c,
            first(o, t) as o 
        from ${tablename.toLowerCase()} 
        ${fromTimestamp ? "where t > " + getTimestampValue(fromTimestamp) : ""}
        group by time_bucket 
        order by time_bucket asc;
    `;
};

const getSimpleDataQuery = (tablename: string, fromTimestamp?: number) => {
    return `
        select 
            *
        from ${tablename.toLowerCase()} 
        ${fromTimestamp ? "where t > " + getTimestampValue(fromTimestamp) : ""}
        order by t asc;
    `;
};

export const getData = async (
    symbol: string,
    fromTimestamp: number,
    timeBucket?: string
): Promise<Bar[]> => {
    const pool = getConnection();

    const tableName = getAggregatedMinuteTableNameForSymbol(symbol);

    const query = getDataQuery(tableName, fromTimestamp, timeBucket);

    LOGGER.debug(query);

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

export const getSimpleData = async (symbol: string, fromTimestamp: number, isMinute = false) => {
    const pool = getConnection();

    const tableName = isMinute
        ? getAggregatedMinuteTableNameForSymbol(symbol)
        : getDailyTableNameForSymbol(symbol);

    const query = getSimpleDataQuery(tableName, fromTimestamp);

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
    });
};
