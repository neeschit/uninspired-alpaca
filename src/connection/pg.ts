import { Pool } from "pg";

const pool = new Pool({
    database: "stock_data"
});

export const getConnection = () => {
    return pool;
};

export const endPooledConnection = () => pool.end();
