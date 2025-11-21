import express from "express";
import { addToCart,getCartDetail,removeItem,clearCart } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isUser } from "../middlewares/roleMiddleware.js";

const router= express.Router();

// ✅ Debug: Test route without auth to verify routing works
router.get("/test", (req, res) => {
    console.log("✅ Cart route test hit!");
    res.json({ message: "Cart route is working!", path: req.path });
});

router.post("/add",protect, isUser, addToCart);

router.get("/", (req, res, next) => {
    console.log("🔍 GET /api/cart route handler hit!");
    next();
}, protect, isUser, getCartDetail);

router.delete("/:id",protect, isUser, removeItem);

router.delete("/", protect,isUser, clearCart);


export default router;