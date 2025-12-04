import { Router } from "express";
import {
  createPedhinamu,
  getPedhinamus,
  saveFullForm,
  getFullPedhinamu,
  updatePedhinamuTree,
  softDeletePedhinamu
} from "../controllers/pedhinamu.controller.js";

const router = Router();

/* ------------------------------------------
   BASIC PEDHINAMU CREATION + LIST
---------------------------------------------*/
router.post("/", createPedhinamu);       // Create Pedhinamu (basic)
router.get("/", getPedhinamus);          // List all (pagination)

/* ------------------------------------------
   FULL FORM (after basic pedhinamu)
---------------------------------------------*/
router.post("/form/:id", saveFullForm);  // Save Full Form
router.get("/:id", getFullPedhinamu);    // Full details (basic + form)

/* ------------------------------------------
   UPDATE TREE (mukhya + heirs + subFamily)
---------------------------------------------*/
router.put("/:id/tree", updatePedhinamuTree); // <—— NEW & REQUIRED

/* ------------------------------------------
   SOFT DELETE
---------------------------------------------*/
router.delete("/:id", softDeletePedhinamu);

export default router;
