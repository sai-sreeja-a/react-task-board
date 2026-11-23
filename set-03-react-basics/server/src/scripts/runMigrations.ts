import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import pool from "../config/database";

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDirectory = path.resolve(process.cwd(), "migrations");

    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const existing = await client.query(
        "SELECT id FROM schema_migrations WHERE migration_name = $1",
        [file]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const sql = await fs.readFile(
        path.join(migrationsDirectory, file),
        "utf-8"
      );

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
          [file]
        );

        await client.query("COMMIT");

        console.log(`Applied migration: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Migration process completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
