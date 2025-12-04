import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String,
  module: String,
  details: Object,
  ip: String
}, { timestamps: true });

export default mongoose.model("ActivityLog", schema);
