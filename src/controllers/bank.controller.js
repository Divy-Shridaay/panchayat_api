import Bank from "../models/Bank.js";

export const createBank = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Missing name" });
    const existing = await Bank.findOne({ name: name.trim(), isDeleted: false });
    if (existing) return res.status(409).json({ message: "Bank already exists" });
    const bank = new Bank({ name: name.trim() });
    await bank.save();
    res.status(201).json(bank);
  } catch (err) {
    next(err);
  }
};

export const getBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({ isDeleted: false }).sort({ name: 1 });
    res.json(banks);
  } catch (err) {
    next(err);
  }
};

export const updateBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Missing name" });
    const bank = await Bank.findById(id);
    if (!bank || bank.isDeleted) return res.status(404).json({ message: "Not found" });
    bank.name = name.trim();
    bank.updatedAt = Date.now();
    await bank.save();
    res.json(bank);
  } catch (err) {
    next(err);
  }
};

export const softDeleteBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bank = await Bank.findById(id);
    if (!bank || bank.isDeleted) return res.status(404).json({ message: "Not found" });
    bank.isDeleted = true;
    bank.updatedAt = Date.now();
    await bank.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};