import { Pool } from "pg";

const pool = new Pool({
    database: "stock_data",
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
});

export const getConnection = () => {
    return pool;
};

export const endPooledConnection = () => pool.end();
