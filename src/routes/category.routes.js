import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  softDeleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", softDeleteCategory);

export default router;
