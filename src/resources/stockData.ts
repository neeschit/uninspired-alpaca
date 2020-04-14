import { getConnection } from "../connection/pg";
import { TickBar, TradeUpdate } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";

const getAggregatedTickTableNameForSymbol = (symbol: string) => `tick_${symbol.toLowerCase()}`;

const getCreateAggregatedSecondBarsTableSql = (tablename: string) => `create table ${tablename} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    a numeric not null,
    v integer not null
);

SELECT create_hypertable('${tablename}', 't');

SELECT set_chunk_time_interval('${tablename}', interval '1 day');
`;

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

const getCreatePositionsTableSql = () => `create table positions (
    id serial primary key,
    planned_stop_price numeric not null,
    planned_entry_price numeric not null,
    symbol varchar(8) not null,
    side varchar(8) not null,
    quantity smallint not null,
    original_quantity smallint not null,
    average_entry_price numeric
);

create index positions_symbol_idx on positions (symbol);
create index positions_side_idx on positions (side);

`;

const getCreateOrdersTableSql = () => `create table orders (
    id serial primary key,
    position_id integer references positions(id),
    symbol varchar(8) not null,
    status text not null,
    side text not null,
    type text not null,
    tif varchar(6) not null,
    price numeric not null,
    quantity smallint not null,
    filled_quantity smallint,
    average_price numeric,
    stop_price numeric,
    alpaca_order_info jsonb
);

create index orders_symbol_idx on orders (symbol);
create index orders_side_idx on orders (side);
create index orders_status_idx on orders (status);

`;

const getStockDataQuery = (symbol: string, timestring = "5 minutes") => {
    return `
        select 
            time_bucket('${timestring}', t) as time_bucket, 
            sum(v) as v,
            min(l) as l,
            max(h) as h,
            last(c, t) as c,
            first(o, t) as o 
        from tick_${symbol.toLowerCase()} 
        group by time_bucket 
        order by time_bucket desc;
    `;
};

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
    const tickTableName = getAggregatedTickTableNameForSymbol(symbol);

    return (await checkIfTableExists(tableName)) && (await checkIfTableExists(tickTableName));
};

export const createStorageTables = async (symbols: string[]) => {
    const pool = getConnection();

    const results = [];

    for (const symbol of symbols) {
        try {
            results.push(await createAggregatedDataTableForSymbol(symbol, pool));
        } catch (e) {
            LOGGER.error(e);
        }
        try {
            results.push(await createTradeDataTableForSymbol(symbol, pool));
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

export const insertBar = async (bar: TickBar, symbol: string) => {
    const pool = getConnection();

    const tablename = getAggregatedTickTableNameForSymbol(symbol);

    const query = `insert into ${tablename} values (
        to_timestamp(${bar.t}::double precision / 1000), 
        ${bar.o}, 
        ${bar.h}, 
        ${bar.l}, 
        ${bar.c}, 
        ${bar.a}, 
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

export const createAggregatedDataTableForSymbol = (symbol: string, pool = getConnection()) => {
    return pool.query(
        getCreateAggregatedSecondBarsTableSql(getAggregatedTickTableNameForSymbol(symbol))
    );
};

export const createTradeDataTableForSymbol = (symbol: string, pool = getConnection()) => {
    const query = getCreateTradesTableSql(getTradeTableNameForSymbol(symbol));
    LOGGER.info(query);
    return pool.query(query);
};
