import { startOfDay } from "date-fns";
import { getConnection } from "../connection/pg";
import { Bar } from "../data/data.model";
import { LOGGER } from "../instrumentation/log";
import { checkIfTableExists, getData, getTimestampValue } from "./stockData";

const firstBarTablePrefix = `first_five_min_bar_`;

const getCreateFirstBarTableSql = (symbol: string) => {
    return `create table ${firstBarTablePrefix}${symbol.toLowerCase()} (
    t timestamptz(3) primary key,
    o numeric not null,
    h numeric not null,
    l numeric not null,
    c numeric not null,
    v integer not null
);`;
};

export async function* checkCreateFirstBarTables(symbols: string[]) {
    const pool = getConnection();
    for (const symbol of symbols) {
        const tableName = `${firstBarTablePrefix}${symbol.toLowerCase()}`;
        const hasTable = await checkIfTableExists(tableName);

        if (!hasTable) {
            await pool.query(getCreateFirstBarTableSql(symbol));
        }

        yield symbol;
    }
}

export const batchInsertFirstBars = async (bars: Bar[], symbol: string) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = `${firstBarTablePrefix}${symbol.toLowerCase()}`;

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

export const selectAverageVolumeFirstBar = async (symbol: string) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = `${firstBarTablePrefix}${symbol.toLowerCase()}`;

    const query = `select avg(v) from ${tablename}`;

    LOGGER.info(query);

    try {
        const result = await client.query(query);

        return Number(result.rows[0].avg);
    } catch (e) {
        LOGGER.error(e);
    } finally {
        client.release();
    }
};

export const selectAverageVolumeFirstBarForWindow = async (
    symbol: string,
    window: number
) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = `${firstBarTablePrefix}${symbol.toLowerCase()}`;

    const query = `select v from ${tablename} order by t desc limit ${window}`;

    LOGGER.debug(query);

    try {
        const result = await client.query(query);

        const sum = result.rows.reduce((avg: number, vol: { v: string }) => {
            avg += Number(vol.v);
            return avg;
        }, 0);

        return sum / window;
    } catch (e) {
        LOGGER.error(e);
    } finally {
        client.release();
    }
};

export const selectAverageVolumeFirstBarForWindowLive = async (
    symbol: string,
    window: number,
    endEpoch: number
) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = `${firstBarTablePrefix}${symbol.toLowerCase()}`;

    const query = `select v from ${tablename} where t < ${getTimestampValue(
        startOfDay(endEpoch).getTime()
    )} order by t desc limit ${window}`;

    /* console.log(query); */

    try {
        const result = await client.query(query);

        const sum = result.rows.reduce((avg: number, vol: { v: string }) => {
            avg += Number(vol.v);
            return avg;
        }, 0);

        return sum / window;
    } catch (e) {
        LOGGER.error(e);
    } finally {
        client.release();
    }
};

export const selectAverageRangeFirstBarForWindowLive = async (
    symbol: string,
    endEpoch: number
) => {
    const pool = getConnection();

    const client = await pool.connect();

    const tablename = `${firstBarTablePrefix}${symbol.toLowerCase()}`;

    const query = `select avg(abs(h - l)) from ${tablename} where t < ${getTimestampValue(
        startOfDay(endEpoch).getTime()
    )}`;

    /* console.log(query); */

    try {
        const result = await client.query(query);

        return result.rows[0].avg;
    } catch (e) {
        LOGGER.error(e);
    } finally {
        client.release();
    }
};

export const getMarketRelativeVolume = async (
    marketStartEpochToday: number
) => {
    const averageVol = await selectAverageVolumeFirstBarForWindowLive(
        "SPY",
        90,
        marketStartEpochToday
    );

    const data = await getData(
        "SPY",
        marketStartEpochToday,
        "5 minutes",
        marketStartEpochToday + 300000
    );

    if (!data.length || !averageVol) {
        throw new Error("average_volume_required");
    }

    return data[0].v / averageVol;
};
