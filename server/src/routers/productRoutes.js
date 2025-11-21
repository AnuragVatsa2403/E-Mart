import express from "express";
import { addProduct, getProductId, getProducts, deleteProduct, updateProduct, getMyProducts, getProductsByCategory, getOfferProducts, toggleStock} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isShopkeeper, isUser } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMulter.js";

const router= express.Router();

router.post("/add",protect,isShopkeeper, upload.array("images",5),addProduct);

router.get("/",getProducts);

router.get("/offers", getOfferProducts); 

router.get("/category/:categoryName", getProductsByCategory);

router.get("/my",protect, isShopkeeper, getMyProducts);

router.get("/:id", getProductId);

router.put("/:id", protect, isShopkeeper, upload.array("images", 5), updateProduct);

router.patch("/:id/stock", protect, isShopkeeper, toggleStock);

router.delete("/:id", protect, isShopkeeper, deleteProduct);



export default router;