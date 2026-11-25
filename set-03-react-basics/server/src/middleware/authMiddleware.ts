
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import pool from "../config/database";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies?.session;

    if (!sessionToken || typeof sessionToken !== "string") {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const result = await pool.query(
      `SELECT user_id
       FROM user_sessions
       WHERE session_token_hash = $1
         AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired session"
      });
      return;
    }

    res.locals.userId = Number(result.rows[0].user_id);

    next();
  } catch (error) {
    next(error);
  }
};
