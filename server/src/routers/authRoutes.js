import express from "express";
import {signup, login, logout, addAddress,getMe, updateProfile} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isUser } from "../middlewares/roleMiddleware.js";


const router= express.Router();


router.post("/signup",signup);


router.post("/login",login);

router.post("/logout", protect, logout);

router.post("/add-address", protect, isUser, addAddress);

router.get("/me", protect,getMe);

router.put("/update-profile", protect, updateProfile);


export default router;
