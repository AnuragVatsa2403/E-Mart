// server/src/utils/notifications.js

import Notification from "../models/Notification.js";

/**
 * Creates an in-app notification AND pushes it in real-time via socket.io
 *
 * @param {Object} options
 * @param {*} io - socket.io instance (req.app.get("io"))
 * @param {*} userId - user who receives notification
 * @param {*} title - short title
 * @param {*} message - detailed message
 * @param {*} meta - extra info (orderId, status)
 * @param {*} type - ORDER_PAID | ORDER_UPDATE | GENERIC
 */
export const createNotification = async ({
  io,
  userId,
  title,
  message,
  meta = {},
  type = "GENERIC",
}) => {
  const notif = await Notification.create({
    user: userId,
    title,
    message,
    meta,
    type,
  });

  // Real-time emit
  try {
    if (io && userId) {
      io.to(String(userId)).emit("notification", {
        id: notif._id,
        title,
        message,
        meta,
        type,
        createdAt: notif.createdAt,
      });
    }
    console.log("🔥 Emitting notification to:", userId);

  } catch (err) {
    console.error("Socket emit failed:", err);
  }

  return notif;
};
