import { Router } from "express";
import { sendOTP, verifyOTP, getAllUsers, getUserDetail, activateUser, getUserStatus, incrementPrintCount } from "../controllers/register.controller.js";
import logger from "../middleware/logger.js";
import auth from "../middleware/auth.js";

const router = Router();

// Step 1: Send OTP
router.post(
  "/send-otp",
  logger("REGISTER", "User", { note: "OTP Send Request" }),
  sendOTP
);

// Step 2: Verify OTP and create account
router.post(
  "/verify-otp",
  logger("REGISTER", "User", { note: "OTP Verification" }),
  verifyOTP
);

// Admin: Get all users
router.get(
  "/admin/users",
  getAllUsers
);

// Admin: Get single user
router.get(
  "/admin/users/:userId",
  getUserDetail
);

// Admin: Activate user
router.put(
  "/admin/users/:userId/activate",
  activateUser
);

// Get user status
router.get(
  "/user/status",
  auth,
  getUserStatus
);

// Increment print count
router.post(
  "/user/increment-print",
  auth,
  incrementPrintCount
);

export default router;
