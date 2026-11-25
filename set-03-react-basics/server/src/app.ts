
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

// General middleware
app.use(express.json());
app.use(cookieParser());

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Board API is running successfully!"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Project routes
app.use("/api/projects", projectRoutes);

// Task routes
app.use("/api/tasks", taskRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Central error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
);

export default app;
