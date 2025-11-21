import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives
    title: { type: String, required: true },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed }, // orderId, status, etc.
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ["ORDER_PAID", "ORDER_UPDATE", "GENERIC"], default: "GENERIC" },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
