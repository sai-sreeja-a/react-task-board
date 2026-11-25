
import { Request, Response, NextFunction } from "express";
import pool from "../config/database";
import {
  registerUser,
  loginUser,
  logoutUser,
  createPasswordResetToken,
  resetPassword
} from "../services/authService";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// SIGN UP
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

       if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({
        success: false,
        message: "Name, valid email and password between 8 characters and 72 bytes are required"
      });
      return;
    }

    if (name.trim().length > 100 || email.trim().length > 255) {
      res.status(400).json({
        success: false,
        message: "Name or email is too long"
      });
      return;
    }

    const result = await registerUser(name, email, password);

    res.cookie("session", result.sessionToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.user
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
      return;
    }

    next(error);
  }
};

// LOGIN
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
      return;
    }

    const result = await loginUser(email, password);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
      return;
    }

    res.cookie("session", result.sessionToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies?.session;

    if (sessionToken) {
      await logoutUser(sessionToken);
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;

    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "User account not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: Number(result.rows[0].id),
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });
  } catch (error) {
    next(error);
  }
};


// REQUEST PASSWORD RESET
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      res.status(400).json({
        success: false,
        message: "A valid email address is required"
      });
      return;
    }

    const token = await createPasswordResetToken(email);

    // Development only: display the reset link in the server console.
    if (token && process.env.NODE_ENV !== "production") {
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";

      console.info(
        "Password reset link:",
        `${frontendUrl}/reset-password?token=${token}`
      );
    }

    // Always return the same response to prevent account enumeration.
    res.status(200).json({
      success: true,
      message: "If an account exists with that email, password reset instructions will be provided."
    });
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      res.status(400).json({
        success: false,
        message: "A valid reset token is required"
      });
      return;
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      Buffer.byteLength(newPassword, "utf8") > 72
    ) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes"
      });
      return;
    }

    const success = await resetPassword(token, newPassword);

    if (!success) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token"
      });
      return;
    }

    res.clearCookie("session", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again."
    });
  } catch (error) {
    next(error);
  }
};

