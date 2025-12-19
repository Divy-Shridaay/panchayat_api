import Category from "../models/Category.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: "Missing name or type" });
    const existing = await Category.findOne({ name: name.trim(), type, isDeleted: false });
    if (existing) return res.status(409).json({ message: "Category already exists" });
    const cat = new Category({ name: name.trim(), type });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { isDeleted: false };
    if (type) filter.type = type;
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Missing name" });
    const cat = await Category.findById(id);
    if (!cat || cat.isDeleted) return res.status(404).json({ message: "Not found" });
    cat.name = name.trim();
    cat.updatedAt = Date.now();
    await cat.save();
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

export const softDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat || cat.isDeleted) return res.status(404).json({ message: "Not found" });
    cat.isDeleted = true;
    cat.updatedAt = Date.now();
    await cat.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
