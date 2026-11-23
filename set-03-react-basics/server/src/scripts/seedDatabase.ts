import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import pool from "../config/database";

const seedDatabase = async (): Promise<void> => {
  try {
    const seedFile = path.resolve(
      process.cwd(),
      "seeds",
      "seed_100k_tasks.sql"
    );

    const sql = await fs.readFile(seedFile, "utf-8");

    await pool.query(sql);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();
