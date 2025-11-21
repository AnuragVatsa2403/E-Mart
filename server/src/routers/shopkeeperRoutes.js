import express from "express";
import { getNearbyShopkeepers, getShopkeeperProducts } from "../controllers/shopkeeperController.js";

const router = express.Router();

router.get("/near", getNearbyShopkeepers);
router.get("/:id/products", getShopkeeperProducts);

export default router;
