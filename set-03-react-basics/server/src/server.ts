
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import pool from "./config/database";

const PORT = 5000;

const startServer = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`Task Board API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
