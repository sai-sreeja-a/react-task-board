import {
  loginRateLimiter,
  passwordResetRateLimiter
} from "../middleware/loginRateLimiter";
import { Router } from "express";

import {
  signup,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  changePassword
} from "../controllers/authController";

import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);
// REQUEST PASSWORD RESET
router.post("/forgot-password", passwordResetRateLimiter, forgotPassword);

// RESET PASSWORD
router.post("/reset-password", passwordResetRateLimiter, changePassword);


export default router;
