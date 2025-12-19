import express from "express";
import multer from "multer";
import { 
  createEntry, 
  uploadExcel, 
  getReport, 
  generatePDFReport,
  getEntry,
  getAllEntries,
  updateEntry,
  softDeleteCashMel
} from "../controllers/cashmel.controller.js";

const router = express.Router();
const upload = multer(); // memory storage

// -------------------------
// Correct Route Ordering
// -------------------------

// Get all entries
router.get("/", getAllEntries);

// Create new entry
router.post("/", upload.none(), createEntry);

// Upload Excel
router.post("/upload-excel", upload.single("file"), uploadExcel);

// JSON Report
router.get("/report", getReport);

// PDF Report
router.get("/report/pdf", generatePDFReport);

// Soft delete (must be BEFORE get by ID)
// router.delete("/:id", softDeleteCashMel);

router.delete("/delete/:id", softDeleteCashMel);


// Update entry
router.post("/:id", upload.none(), updateEntry);

// Get single entry by ID (must be LAST)
router.get("/:id", getEntry);

export default router;
