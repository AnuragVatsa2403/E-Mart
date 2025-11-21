// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Support "Bearer <token>" or direct cookie token
    const token = authHeader?.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    // decoded should contain id, role, email
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Attach full user (without password) to req.user
    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("protect() error:", error.message || error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role guard helper
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};
