import { createPool, type Pool } from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import { createRetryDb } from "./retry";

let pool: Pool | null = null;
let db: MySql2Database<typeof schema> | null = null;

export function getPool(): Pool {
	if (!pool) {
		pool = createPool({
			host: process.env.DB_HOST || "localhost",
			user: process.env.DB_USER || "root",
			password: process.env.DB_PASS || "root",
			database: process.env.DB_NAME || "tracker",
			connectionLimit: 10,
			timezone: "Z",
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
		});
	}
	return pool;
}

export function getDb(): MySql2Database<typeof schema> {
	if (!db) {
		db = createRetryDb(drizzle(getPool(), { schema, mode: "default" }));
	}
	return db;
}
