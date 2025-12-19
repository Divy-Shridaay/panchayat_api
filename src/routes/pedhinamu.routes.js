import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createPedhinamu,
  getPedhinamus,
  saveFullForm,
  getFullPedhinamu,
  updatePedhinamuTree,
  softDeletePedhinamu
} from "../controllers/pedhinamu.controller.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

/* ------------------------------------------
   BASIC PEDHINAMU CREATION + LIST
---------------------------------------------*/
router.post("/", createPedhinamu);       // Create Pedhinamu (basic)
router.get("/", getPedhinamus);   
router.put("/:id", updatePedhinamuTree);
       // List all (pagination)

/* ------------------------------------------
   FULL FORM (after basic pedhinamu)
---------------------------------------------*/
router.post("/form/:id", upload.any(), saveFullForm);  // Save Full Form with photo uploads
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