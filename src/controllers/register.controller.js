import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      email,
      phone
    } = req.body;

    // Validate minimum fields
    if (!firstName || !lastName || !gender || !phone) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // Auto username (Gujarati safe)
    const username = `${firstName}_${Date.now()}`;

    // Default password = last 4 digits of phone
    const rawPassword = phone.slice(-4);
    const password = await bcrypt.hash(rawPassword, 10);

    const newUser = await User.create({
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      email,
      phone,

      name: `${firstName} ${middleName} ${lastName}`,

      username,
      password,
      role: "clerk",
      isDeleted: false
    });

    return res.json({
      message: "User registered successfully",
      username,
      tempPassword: rawPassword,
      user: newUser
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
};
