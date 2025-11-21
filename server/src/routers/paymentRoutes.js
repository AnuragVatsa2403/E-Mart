// server/src/routers/paymentRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createRazorpayOrder,
  razorpayWebhook,
  verifyPayment
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay order (protected)
router.post("/create-order", protect, createRazorpayOrder);

// Client calls this after successful checkout to verify & mark order paid (protected)
router.post("/verify", protect, verifyPayment);

// Razorpay will POST webhooks to this endpoint. This must be mounted as raw body route in server.js
// Note: webhook route should be public (no auth)
router.post("/razorpay/webhook", razorpayWebhook);

export default router;
