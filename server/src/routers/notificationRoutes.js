import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ---------------------------------------------
   GET all notifications for logged-in user
---------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------
   Mark a notification as read
---------------------------------------------- */
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
