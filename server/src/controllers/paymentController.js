// server/src/controllers/paymentController.js

import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
import { createNotification } from "../utils/notifications.js";

dotenv.config();

/* --------------------------------------------------
   Razorpay Credentials
-------------------------------------------------- */
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

/* --------------------------------------------------
   Razorpay Instance
-------------------------------------------------- */
export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* --------------------------------------------------
   Create Razorpay Order (Frontend Calls This)
-------------------------------------------------- */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || amount == null) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: orderId,
    };

    const rzpOrder = await razorpay.orders.create(options);

    res.json({ success: true, razorpayOrder: rzpOrder });
  } catch (err) {
    console.error("❌ createRazorpayOrder error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

/* --------------------------------------------------
   Verify Payment (After Checkout)
-------------------------------------------------- */
export const verifyPayment = async (req, res) => {

  console.log("\n--------------------------------");
  console.log("🔥 VERIFY PAYMENT HIT");
  console.log("BODY:", req.body);
  console.log("--------------------------------\n");

  
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing verification parameters" });
    }

    // Validate HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.warn("❌ Signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Payment verified → Update DB
    const order = await Order.findById(orderId).populate("user shopkeeper");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paid = true;
    order.paymentProvider = "razorpay";
    order.paymentId = razorpayPaymentId;
    order.paidAt = new Date();
    order.status = "Confirmed";
    order.paymentMetadata = { razorpayOrderId };

    await order.save();

    /* --------------------------------------------------
       🔔 In-App Notification
    -------------------------------------------------- */
    try {
      const io = req.app.get("io");

      await createNotification({
        io,
        userId: order.user,
        title: "Payment Successful",
        message: `Your payment for Order #${String(order._id).slice(-6)} was received.`,
        meta: { orderId: order._id },
        type: "ORDER_PAID",
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    // Send email + sms
    sendOrderReceiptEmail(order);
    notifyShopkeeperSms(order);
    notifyUserSms(order);

    res.json({ success: true, message: "Payment verified", order });
  } catch (err) {
    console.error("❌ verifyPayment error:", err);
    res.status(500).json({ message: err.message || "Verification failed" });
  }
};

/* --------------------------------------------------
   Razorpay Webhook (Server → Server)
-------------------------------------------------- */
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const raw = req.rawBody || JSON.stringify(req.body);

    const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(raw).digest("hex");

    if (expected !== signature) {
      console.warn("❌ Webhook signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body;

    if (event.event !== "payment.captured") return res.json({ status: "ignored" });

    const payment = event.payload.payment.entity;
    const { order_id: razorpayOrderId } = payment;

    const order = await Order.findOne({
      "paymentMetadata.razorpayOrderId": razorpayOrderId,
    }).populate("user shopkeeper");

    if (!order) {
      return res.json({ status: "ignored" });
    }

    order.paid = true;
    order.paymentId = payment.id;
    order.paymentProvider = "razorpay";
    order.paidAt = new Date();
    order.status = "Confirmed";
    order.paymentMetadata = {
      razorpayOrderId,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
    };

    await order.save();

    /* --------------------------------------------------
       🔔 Webhook Notification
    -------------------------------------------------- */
    try {
      const io = req.app.get("io");

      await createNotification({
        io,
        userId: order.user,
        title: "Payment Successful",
        message: `Your payment for Order #${String(order._id).slice(-6)} was captured.`,
        meta: { orderId: order._id },
        type: "ORDER_PAID",
      });
    } catch (err) {
      console.error("Webhook notification error:", err);
    }

    // Email + SMS
    sendOrderReceiptEmail(order);
    notifyShopkeeperSms(order);
    notifyUserSms(order);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ razorpayWebhook error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------------------------------
   Email Receipt
-------------------------------------------------- */
async function sendOrderReceiptEmail(order) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <h3>Order Receipt — #${String(order._id).slice(-6)}</h3>
      <p>Payment ID: ${order.paymentId}</p>
      <p><strong>Total: ₹${order.total}</strong></p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.user?.email,
      subject: `Order Receipt — #${String(order._id).slice(-6)}`,
      html,
    });
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

/* --------------------------------------------------
   SMS Helpers
-------------------------------------------------- */


async function notifyShopkeeperSms(order) {
  console.log("SMS disabled — Skipping shopkeeper SMS for order", order._id);
}


async function notifyUserSms(order) {
  console.log("SMS disabled — Skipping user SMS for order", order._id);
}

