import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Allow access for all authenticated users, front-end will handle restrictions
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}
