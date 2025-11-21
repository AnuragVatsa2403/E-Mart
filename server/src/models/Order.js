// server/src/models/Order.js
import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shopkeeper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
    },

    // For payment gateway or UPI
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD", "CARD", "RAZORPAY", "STRIPE"],
      default: "UPI",
    },

    paid: { type: Boolean, default: false },           // has payment been completed?
    paymentProvider: { type: String, default: null },  // "razorpay" | "stripe"
    paymentId: { type: String, default: null },        // gateway payment id (razorpay_payment_id etc)
    paidAt: { type: Date, default: null },             // timestamp of payment
    paymentMetadata: { type: Schema.Types.Mixed, default: {} }, // optional small details (card last4, upi vpa etc)


    // For real-time location tracking and shop → user route
    deliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ deliveryLocation: "2dsphere" });

export default mongoose.model("Order", orderSchema);
