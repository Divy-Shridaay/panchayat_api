import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["aavak", "javak"], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
});

export default mongoose.model("Category", schema);
