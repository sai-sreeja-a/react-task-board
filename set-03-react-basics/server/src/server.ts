
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Task Board API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
