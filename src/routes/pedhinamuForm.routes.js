import { Router } from "express";
import {
  createPedhinamu,
  getPedhinamus,
  saveFullForm,
  getFullPedhinamu
} from "../controllers/pedhinamu.controller.js";

const router = Router();

router.post("/", createPedhinamu);
router.get("/", getPedhinamus);

// Full form after basic pedhinamu saved
router.post("/form/:id", saveFullForm);
router.get("/:id", getFullPedhinamu);

export default router;
