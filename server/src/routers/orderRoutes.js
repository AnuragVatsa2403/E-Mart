import express from "express";
import { createOrder, getUserOrders, getShopkeeperOrders, getWeeklyStats, updateOrderStatus} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isUser, isShopkeeper } from "../middlewares/roleMiddleware.js";

const router= express.Router();

// ✅ User routes
router.get("/my", (req, res, next) => {
  console.log("🔍 GET /api/orders/my route handler hit!");
  console.log("   Full URL:", req.originalUrl);
  console.log("   Method:", req.method);
  console.log("   Headers:", JSON.stringify(req.headers, null, 2));
  next();
}, protect, isUser, getUserOrders);
router.post("/",protect,isUser, createOrder);

// ✅ Shopkeeper routes
router.get("/my-shop-orders", protect, isShopkeeper, getShopkeeperOrders);

// PUT /api/orders/:id  → Update order status (shopkeeper only)
router.put("/:id", protect, isShopkeeper, updateOrderStatus);


router.get(
  "/my-shop-orders-weekly",
  protect,
  isShopkeeper,
  getWeeklyStats
);


export default router;