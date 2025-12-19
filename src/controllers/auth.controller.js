import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1) HARD-CODED ADMIN LOGIN
    
    if (username === "admin" && password === "admin") {
      const token = jwt.sign(
        { _id: "admin_static_id", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Admin login successful",
        token,
        user: {
          _id: "admin_static_id",
          username: "admin",
          role: "admin",
          name: "System Admin"
        }
      });
    }

    // 2) NORMAL USER LOGIN
    const user = await User.findOne({ username, isDeleted: false });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return res.json({
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};
