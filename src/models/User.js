import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },       // Gujarati allowed
  middleName: { type: String },
  lastName: { type: String, required: true },

  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dob: { type: String },                             // store Gujarati or English

  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  
  // New fields for registration
  pinCode: { type: String, required: true },
  taluko: { type: String, required: true },

  // Auto-generated fields
  name: { type: String },                            // Full Gujarati name
  // During registration we generate username/password after OTP verification.
  // Make these optional at insert so upserts that only set email/otp don't create
  // documents with `username: null` which conflicts with a strict unique index.
  // username: { type: String, unique: true, sparse: true },
  // password: { type: String },

   username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "sarpanch", "clerk"],
    default: "clerk"
  },
  
  // OTP fields
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },

  // Password reset fields
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  isDeleted: { type: Boolean, default: false },

  // Trial period fields
  trialStartDate: { type: Date },

  // Payment and print fields
  isPaid: { type: Boolean, default: false },
  printCount: { type: Number, default: 0 },

}, { timestamps: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", UserSchema);
