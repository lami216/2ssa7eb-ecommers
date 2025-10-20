import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { createCoupon, listCoupons, updateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/", protectRoute, adminRoute, createCoupon);
router.get("/", protectRoute, adminRoute, listCoupons);
router.patch("/:id", protectRoute, adminRoute, updateCoupon);

export default router;
