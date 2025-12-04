import { Router } from "express";
import { register } from "../controllers/register.controller.js";
import logger from "../middleware/logger.js";

const router = Router();

router.post(
  "/",
  logger("REGISTER", "User", { note: "User Registration Started" }),
  register
);

export default router;
