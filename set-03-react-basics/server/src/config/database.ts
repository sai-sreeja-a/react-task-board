import "dotenv/config";
import { Pool } from "pg";

const isTestEnvironment = process.env.NODE_ENV === "test";

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,

  database: isTestEnvironment
    ? process.env.PGTESTDATABASE || "task_tracker_test_db"
    : process.env.PGDATABASE || "task_tracker_db",

  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;