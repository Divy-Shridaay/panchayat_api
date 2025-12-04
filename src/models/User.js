import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },       // Gujarati allowed
  middleName: { type: String },
  lastName: { type: String, required: true },

  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dob: { type: String },                             // store Gujarati or English

  email: { type: String },
  phone: { type: String, required: true },

  // Auto-generated fields
  name: { type: String },                            // Full Gujarati name
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "sarpanch", "clerk"],
    default: "clerk"
  },

  isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
