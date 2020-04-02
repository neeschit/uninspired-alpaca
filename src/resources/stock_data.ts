import { getConnection } from "../connection/pg";
import { TickBar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";

export const insertBar = async (bar: TickBar, symbol: string) => {
    const pool = getConnection();

    pool.query(
        `insert into ('bar_data') values (${bar.t}, '${symbol}', ${bar.o}, ${bar.c}, ${bar.h}, ${bar.l}, ${bar.a}, ${bar.v}) `
    );
};

const getTableNameForSymbol = (symbol: string) => `tick_${symbol.toLowerCase()}`;

const getCreateBarsTableSql = (tablename: string) => `create table ${tablename} (
    t timestamptz not null,
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
    const tableName = getTableNameForSymbol(symbol);

    return checkIfTableExists(tableName);
};

export const createStorageTables = async (symbols: string[]) => {
    const pool = getConnection();

    const results = [];

    for (const symbol of symbols) {
        try {
            results.push(await pool.query(getCreateBarsTableSql(getTableNameForSymbol(symbol))));
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
