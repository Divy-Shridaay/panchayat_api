import CashMel from "../models/CashMel.js";
import XLSX from "xlsx";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

export const createEntry = async (req, res, next) => {
  try {
    
    const { date, name, receiptPaymentNo, vyavharType, category, amount, paymentMethod, bank, ddCheckNum, remarks } = req.body;
    const panchayatId = req.params.id || req.body.panchayatId || null;

    const entry = await CashMel.create({
      panchayatId,
      date,
      name,
      receiptPaymentNo,
      vyavharType,
      category,
      amount: Number(amount),
      paymentMethod,
      bank,
      ddCheckNum,
      remarks,
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
    const entry = await CashMel.findById(id).lean();
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

// Get all entries
// Duplicate removed

// Get all entries
export const getAllEntries = async (req, res, next) => {
  try {
    const entries = await CashMel.find({}).sort({ date: -1 }).lean();
    return res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
    const { date, name, receiptPaymentNo, vyavharType, category, amount, paymentMethod, bank, ddCheckNum, remarks } = req.body;
    const update = { date, name, receiptPaymentNo, vyavharType, category, paymentMethod, bank, ddCheckNum, remarks };
    if (typeof amount !== 'undefined') update.amount = Number(amount);

    const updated = await CashMel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const mapVyavhar = (val = "") => {
  val = val.toString().trim();

  // Gujarati → English enum mapping
  if (val === "આવક") return "aavak";
  if (val === "જાવક") return "javak";

  // fallback
  return val.toLowerCase();
};

export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const buffer = req.file.buffer;
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const saved = [];
    const errors = [];

    function parseExcelDate(val) {
      if (!val) return null;

      const s = String(val).trim();

      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }

      const num = Number(s);
      if (!isNaN(num)) {
        const dt = new Date((num - 25569) * 86400 * 1000);
        return dt.toISOString().split("T")[0];
      }

      return s;
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];

      const dateISO = parseExcelDate(r.date);
      const name = r.name || "";
      const receiptPaymentNo = r.receiptPaymentNo || "";
      const vyavharType = mapVyavhar(r.vyavharType);
      const category = r.category || "";
      const amount = Number(r.amount || 0);

      // Required field validation
      if (!dateISO || !name || !vyavharType || !category || !amount) {
        errors.push({
          row: i + 2,
          raw: r,
          reason: "Missing required fields",
        });
        continue;
      }

      await CashMel.create({
        date: dateISO,
        name,
        receiptPaymentNo,
        vyavharType,
        category,
        amount,
      });

      saved.push(r);
    }

    return res.json({
      success: true,
      savedCount: saved.length,
      errorRows: errors.length,
      errors,
    });

  } catch (err) {
    next(err);
  }
};




export const generatePDFReport = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    const q = { isDeleted: false };
    if (type) q.vyavharType = type;
    if (from) q.date = { $gte: from };
    if (to) q.date = q.date ? { ...q.date, $lte: to } : { $lte: to };

    const rows = await CashMel.find(q).sort({ date: 1 }).lean();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // If a special form template exists for this type, use it. Otherwise fall back to default report.ejs
    const formTemplatePath = path.join(__dirname, "..", "views", "report_form.ejs");
    const defaultTemplatePath = path.join(__dirname, "..", "views", "report.ejs");

    let templatePath = defaultTemplatePath;
    let templateData = { rows, type, from, to };

    // If user requests a form-like PDF (e.g., aavak/tarij/passbook) and a form template exists, use it
    if (fs.existsSync(formTemplatePath)) {
      // try to detect types that need form template. You can adjust this condition as needed.
      if (type === 'aavak' || type === 'tarij' || type === 'passbook') {
        templatePath = formTemplatePath;

        // If a background image is present alongside the template, embed it as base64 data URI
        const bgImagePath = path.join(__dirname, "..", "views", "report_bg.png");
        if (fs.existsSync(bgImagePath)) {
          const imgBuf = fs.readFileSync(bgImagePath);
          const mime = 'image/png';
          const dataUri = `data:${mime};base64,${imgBuf.toString('base64')}`;
          templateData.imageData = dataUri;
        }
      }
    }

    const html = await ejs.renderFile(templatePath, templateData, { async: true });

    // Launch puppeteer and render PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    // naive filter by date string inclusion or ISO comparison if provided
    const q = { isDeleted: false };
    if (type) q.vyavharType = type;
    if (from) q.date = { $gte: from };
    if (to) q.date = q.date ? { ...q.date, $lte: to } : { $lte: to };

    const rows = await CashMel.find(q).sort({ date: 1 }).lean();

    // if client expects JSON preview, return rows
    return res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 6. SOFT DELETE (CashMel)
// ============================================================
export const softDeleteCashMel = async (req, res) => {
  try {
    const { id } = req.params;

    await CashMel.findByIdAndUpdate(id, { isDeleted: true });

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

