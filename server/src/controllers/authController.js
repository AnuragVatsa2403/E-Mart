// controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/GenerateTokens.js";

const DEFAULT_ACCESS_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "7d";
const DEFAULT_REFRESH_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "30d";

// Helper: set refresh token as HttpOnly cookie (optional)
const sendRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    // secure true in production (HTTPS)
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    path: "/api/auth/refresh", // limit cookie to endpoint (optional)
  };
  res.cookie("refreshToken", token, cookieOptions);
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, role = "user", addresses = [], location } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "username, email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ username, email, password, role, addresses });

    if (location?.latitude && location?.longitude) {
      user.location = {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      };
    }

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken on user (rotate token pattern)
    user.refreshToken = refreshToken;
    await user.save();

    // Optional: set refresh token cookie
    // sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: "Signup successful",
      token: accessToken,
      refreshToken, // optional: you may choose not to send refresh token in body
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: `Login successful! Welcome ${user.username}`,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    // If protect middleware used, req.user exists
    const userId = req.user?._id || req.body?.userId;
    if (!userId) return res.status(400).json({ message: "User id required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = null;
    await user.save();

    // clear cookie if used
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Refresh access token using a refresh token
export const refreshToken = async (req, res) => {
  try {
    // Prefer cookie; fallback to body or header
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];
    if (!incomingToken) return res.status(401).json({ message: "Refresh token missing" });

    const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_TOKEN);
    if (!decoded?.id) return res.status(401).json({ message: "Invalid refresh token" });

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) return res.status(401).json({ message: "Invalid refresh token" });

    // Optionally check if stored refresh token matches incoming (rotate tokens)
    if (user.refreshToken !== incomingToken) {
      // Token rotation / reuse detection: reject and clear refresh token
      user.refreshToken = null;
      await user.save();
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotate refresh token (save new one)
    user.refreshToken = newRefreshToken;
    await user.save();

    // sendRefreshTokenCookie(res, newRefreshToken);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      message: "Token refreshed",
    });
  } catch (err) {
    console.error("refreshToken error:", err?.message || err);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// Add address (requires protect)
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone, address, city, state, zip, lat, lng } = req.body;
    const newAddress = { name, phone, address, city, state, zip };

    user.addresses = user.addresses || [];
    user.addresses.push(newAddress);

    if (lat && lng) {
      user.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    await user.save();

    res.status(201).json({ message: "Address added", user });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    res.json({ success: true, user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (req, res) => {
  try {
    const { username, phone, address, city, state, zip } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        phone,
        addresses: [
          {
            address,
            city,
            state,
            zip,
          },
        ],
      },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};