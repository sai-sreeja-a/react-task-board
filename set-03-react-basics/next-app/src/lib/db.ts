
import "server-only";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

const pool =
  globalForPg.pgPool ??
  new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || "task_tracker_db",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;
