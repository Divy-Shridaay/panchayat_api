import express from "express";
import {
  createBank,
  getBanks,
  updateBank,
  softDeleteBank,
} from "../controllers/bank.controller.js";

const router = express.Router();

router.get("/", getBanks);
router.post("/", createBank);
router.put("/:id", updateBank);
router.delete("/:id", softDeleteBank);

export default router;