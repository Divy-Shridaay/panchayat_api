import mongoose from "mongoose";

const schema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"] },
  amount: Number,
  description: String,
  date: String,
  isDeleted: { type: Boolean, default: false }
});

export default mongoose.model("Transaction", schema);
